import io
import gzip
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app, init_super_admin
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User
from app.models.backup import BackupRecord, BackupSchedule
from app.core.security import hash_password

init_super_admin()
client = TestClient(app)

def get_super_admin_token():
    res = client.post("/auth/login", json={
        "email": settings.SUPER_ADMIN_EMAIL,
        "password": settings.SUPER_ADMIN_PASSWORD
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def get_normal_user_token():
    db = SessionLocal()
    email = f"normal_{datetime.now().timestamp()}@test.com"
    pwd = "NormalUser123!#"
    try:
        user = User(
            email=email,
            name="Normal User",
            password_hash=hash_password(pwd),
            role="admin",
            is_super_admin=False
        )
        db.add(user)
        db.commit()
    finally:
        db.close()

    res = client.post("/auth/login", json={"email": email, "password": pwd})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_non_super_admin_cannot_access_backups():
    token = get_normal_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Deve retornar 403 em todos os endpoints de backup
    assert client.get("/backups/", headers=headers).status_code == 403
    assert client.get("/backups/metrics", headers=headers).status_code == 403
    assert client.post("/backups/create", headers=headers).status_code == 403
    assert client.get("/backups/schedule", headers=headers).status_code == 403
    assert client.put("/backups/schedule", headers=headers, json={"is_active": False, "frequency": "hours", "interval_value": 12, "s3_folder": "test/", "retention_limit": 10}).status_code == 403

def test_get_backup_metrics_and_schedule():
    token = get_super_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Consulta agenda
    res_sched = client.get("/backups/schedule", headers=headers)
    assert res_sched.status_code == 200
    sched = res_sched.json()
    assert "is_active" in sched
    assert "interval_value" in sched
    assert "retention_limit" in sched

    # Consulta métricas
    res_met = client.get("/backups/metrics", headers=headers)
    assert res_met.status_code == 200
    met = res_met.json()
    assert "retention_limit" in met
    assert "frequency_text" in met
    assert "total_backups" in met

def test_update_backup_schedule():
    token = get_super_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "is_active": True,
        "frequency": "hours",
        "interval_value": 12,
        "s3_folder": "vturb/production_backups/",
        "retention_limit": 50
    }
    res = client.put("/backups/schedule", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["interval_value"] == 12
    assert data["s3_folder"] == "vturb/production_backups/"
    assert data["retention_limit"] == 50

def test_create_manual_backup_flow():
    token = get_super_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Executa snapshot manual
    res = client.post("/backups/create", headers=headers)
    assert res.status_code == 200
    backup = res.json()
    assert "id" in backup
    assert "filename" in backup
    assert backup["filename"].endswith(".dump.gz")
    assert backup["status"] == "completed"
    backup_id = backup["id"]

    # Verifica se consta na listagem
    res_list = client.get("/backups/", headers=headers)
    assert res_list.status_code == 200
    ids = [b["id"] for b in res_list.json()]
    assert backup_id in ids

    # Download do arquivo
    res_down = client.get(f"/backups/{backup_id}/download", headers=headers)
    assert res_down.status_code == 200
    assert len(res_down.content) > 0

    # Restauração do arquivo
    res_rest = client.post(f"/backups/{backup_id}/restore", headers=headers)
    assert res_rest.status_code == 200
    assert "restaurado com sucesso" in res_rest.json()["detail"].lower()

    # Exclusão individual
    res_del = client.delete(f"/backups/{backup_id}", headers=headers)
    assert res_del.status_code == 200
    assert "excluído com sucesso" in res_del.json()["detail"].lower()

def test_upload_external_backup_and_bulk_delete():
    token = get_super_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Cria conteúdo gzip simulando dump
    content = b"-- Dump externo de teste\nSELECT 1;\n"
    gz_buffer = io.BytesIO()
    with gzip.open(gz_buffer, "wb") as f:
        f.write(content)
    gz_bytes = gz_buffer.getvalue()

    files = {"file": ("external_backup_test.dump.gz", gz_bytes, "application/gzip")}
    res_upload = client.post("/backups/upload", headers=headers, files=files)
    assert res_upload.status_code == 200
    up_data = res_upload.json()
    assert up_data["is_external"] is True
    uploaded_id = up_data["id"]

    # Cria outro backup manual para testar bulk delete
    b2 = client.post("/backups/create", headers=headers).json()
    b2_id = b2["id"]

    # Executa bulk delete dos dois
    bulk_res = client.post("/backups/bulk-delete", headers=headers, json={"ids": [uploaded_id, b2_id]})
    assert bulk_res.status_code == 200
    bulk_data = bulk_res.json()
    assert bulk_data["deleted_count"] == 2
    assert uploaded_id in bulk_data["deleted_ids"]
    assert b2_id in bulk_data["deleted_ids"]
