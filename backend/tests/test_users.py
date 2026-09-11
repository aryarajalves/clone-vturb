import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app, init_super_admin
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User, UserInvite
from app.core.security import hash_password

init_super_admin()
client = TestClient(app)

def get_admin_token():
    res = client.post("/auth/login", json={
        "email": settings.SUPER_ADMIN_EMAIL,
        "password": settings.SUPER_ADMIN_PASSWORD
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def test_list_users_includes_super_admin():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/users/", headers=headers)
    assert res.status_code == 200
    users = res.json()
    assert isinstance(users, list)
    assert len(users) >= 1

    super_admins = [u for u in users if u["is_super_admin"] or u["role"] == "super_admin"]
    assert len(super_admins) >= 1
    assert any(u["email"] == settings.SUPER_ADMIN_EMAIL.lower() for u in super_admins)

def test_super_admin_cannot_be_deleted():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Busca o super admin configurado
    users_res = client.get("/users/", headers=headers)
    super_admin = next(u for u in users_res.json() if u["email"] == settings.SUPER_ADMIN_EMAIL.lower())

    # Tentativa de deletar o super admin deve retornar 400
    del_res = client.delete(f"/users/{super_admin['id']}", headers=headers)
    assert del_res.status_code == 400
    assert "Super Admin não pode ser excluído" in del_res.json()["detail"]

def test_create_invite_validation():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Bloqueia criação de convite para SuperAdmin
    res = client.post("/users/invites", headers=headers, json={
        "role": "super_admin",
        "duration_hours": 24
    })
    assert res.status_code == 400
    assert "SuperAdmin não pode ser criado via convite" in res.json()["detail"]

    # Bloqueia duração inválida
    res_dur = client.post("/users/invites", headers=headers, json={
        "role": "user",
        "duration_hours": 0
    })
    assert res_dur.status_code == 400

    # Criação de convite válido para Admin
    res_admin = client.post("/users/invites", headers=headers, json={
        "role": "admin",
        "duration_hours": 48
    })
    assert res_admin.status_code == 200
    data_admin = res_admin.json()
    assert data_admin["role"] == "admin"
    assert "token" in data_admin
    assert data_admin["is_used"] is False
    assert "/invite/" in data_admin["invite_url"]

    # Criação de convite válido para Usuário
    res_user = client.post("/users/invites", headers=headers, json={
        "role": "user",
        "duration_hours": 24
    })
    assert res_user.status_code == 200
    data_user = res_user.json()
    assert data_user["role"] == "user"

def test_invite_validation_and_expiration():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Gera convite válido
    res_inv = client.post("/users/invites", headers=headers, json={
        "role": "user",
        "duration_hours": 24
    })
    inv_token = res_inv.json()["token"]

    # Valida convite via rota pública
    val_res = client.get(f"/auth/invite/{inv_token}")
    assert val_res.status_code == 200
    assert val_res.json()["valid"] is True
    assert val_res.json()["role"] == "user"

    # Token inexistente
    val_not_found = client.get("/auth/invite/token-inexistente-123")
    assert val_not_found.status_code == 404

    # Expiração manual no banco para teste
    db = SessionLocal()
    try:
        inv = db.query(UserInvite).filter(UserInvite.token == inv_token).first()
        inv.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
        db.commit()
    finally:
        db.close()

    val_expired = client.get(f"/auth/invite/{inv_token}")
    assert val_expired.status_code == 400
    assert "expirou" in val_expired.json()["detail"].lower()

def test_register_via_invite_with_strong_password_rules():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Gera convite novo
    res_inv = client.post("/users/invites", headers=headers, json={
        "role": "admin",
        "duration_hours": 24
    })
    inv_token = res_inv.json()["token"]
    test_email = f"novo_admin_{datetime.now().timestamp()}@vturb.com"

    # 1. Menos de 12 caracteres
    r1 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "Short1!Aa"  # 9 chars
    })
    assert r1.status_code == 400
    assert "12 caracteres" in r1.json()["detail"]

    # 2. Sem maiúscula
    r2 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "lowercase123!@#"  # sem maiúscula
    })
    assert r2.status_code == 400
    assert "maiúscula" in r2.json()["detail"]

    # 3. Sem minúscula
    r3 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "UPPERCASE123!@#"  # sem minúscula
    })
    assert r3.status_code == 400
    assert "minúscula" in r3.json()["detail"]

    # 4. Sem número
    r4 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "NoNumbersHere!@#"  # sem números
    })
    assert r4.status_code == 400
    assert "número" in r4.json()["detail"]

    # 5. Sem caractere especial
    r5 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "NoSpecialChar12345"  # sem caractere especial
    })
    assert r5.status_code == 400
    assert "especial" in r5.json()["detail"]

    # 6. Senha válida atendendo a todos os critérios (12+ chars, maiúscula, minúscula, número, especial)
    valid_password = "SecurePassword2026!#"
    r_success = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": valid_password
    })
    assert r_success.status_code == 200
    auth_data = r_success.json()
    assert "access_token" in auth_data
    assert auth_data["user"]["email"] == test_email.lower()
    assert auth_data["user"]["role"] == "admin"
    created_user_id = auth_data["user"]["id"]

    # 7. Tentativa de reutilizar o mesmo token já utilizado deve ser rejeitada
    r_reused = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": f"outro_{datetime.now().timestamp()}@vturb.com",
        "password": valid_password
    })
    assert r_reused.status_code == 400
    assert "já foi utilizado" in r_reused.json()["detail"]

    # 8. Exclusão do usuário criado (usuário comum/admin pode ser excluído)
    del_res = client.delete(f"/users/{created_user_id}", headers=headers)
    assert del_res.status_code == 200
    assert "excluído com sucesso" in del_res.json()["detail"]
