import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app, init_super_admin
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User, UserInvite, EmailVerificationCode
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
    assert len(super_admins) == 1
    assert super_admins[0]["email"] == settings.SUPER_ADMIN_EMAIL.lower()
    assert super_admins[0]["role"] == "super_admin"

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

def test_register_via_invite_with_strong_password_and_code():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Gera convite novo
    res_inv = client.post("/users/invites", headers=headers, json={
        "role": "admin",
        "duration_hours": 24
    })
    inv_token = res_inv.json()["token"]
    test_email = f"novo_admin_{datetime.now().timestamp()}@vturb.com"

    # 1. Enviar código de verificação via Brevo
    send_res = client.post("/auth/send-verification-code", json={
        "token": inv_token,
        "email": test_email,
        "name": "Admin Test"
    })
    assert send_res.status_code == 200
    assert "Código de verificação enviado" in send_res.json()["message"]

    # Recupera o código gerado no banco de dados
    db = SessionLocal()
    try:
        entry = db.query(EmailVerificationCode).filter(
            EmailVerificationCode.email == test_email.lower(),
            EmailVerificationCode.token == inv_token
        ).order_by(EmailVerificationCode.id.desc()).first()
        assert entry is not None
        verification_code = entry.code
        assert len(verification_code) == 6
    finally:
        db.close()

    # 2. Código incorreto deve ser rejeitado com 400
    r_bad_code = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "SecurePassword2026!#",
        "code": "000000"
    })
    assert r_bad_code.status_code == 400
    assert "inválido" in r_bad_code.json()["detail"].lower()

    # 3. Menos de 12 caracteres
    r1 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "Short1!Aa",  # 9 chars
        "code": verification_code
    })
    assert r1.status_code == 400
    assert "12 caracteres" in r1.json()["detail"]

    # 4. Sem maiúscula
    r2 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "lowercase123!@#",
        "code": verification_code
    })
    assert r2.status_code == 400
    assert "maiúscula" in r2.json()["detail"]

    # 5. Sem minúscula
    r3 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "UPPERCASE123!@#",
        "code": verification_code
    })
    assert r3.status_code == 400
    assert "minúscula" in r3.json()["detail"]

    # 6. Sem número
    r4 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "NoNumbersHere!@#",
        "code": verification_code
    })
    assert r4.status_code == 400
    assert "número" in r4.json()["detail"]

    # 7. Sem caractere especial
    r5 = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": "NoSpecialChar12345",
        "code": verification_code
    })
    assert r5.status_code == 400
    assert "especial" in r5.json()["detail"]

    # 8. Sucesso com código correto e senha forte
    valid_password = "SecurePassword2026!#"
    r_success = client.post("/auth/register-invite", json={
        "token": inv_token,
        "email": test_email,
        "password": valid_password,
        "code": verification_code
    })
    assert r_success.status_code == 200
    auth_data = r_success.json()
    assert "access_token" in auth_data
    assert auth_data["user"]["email"] == test_email.lower()
    assert auth_data["user"]["role"] == "admin"
    created_user_id = auth_data["user"]["id"]

    # 9. Bloqueio de e-mail duplicado ao tentar enviar código para e-mail que já existe
    res_inv2 = client.post("/users/invites", headers=headers, json={
        "role": "user",
        "duration_hours": 24
    })
    inv_token2 = res_inv2.json()["token"]
    dup_res = client.post("/auth/send-verification-code", json={
        "token": inv_token2,
        "email": test_email,
        "name": "Dup User"
    })
    assert dup_res.status_code == 400
    assert "já está cadastrado no sistema" in dup_res.json()["detail"]

    # 10. Exclusão do usuário criado
    del_res = client.delete(f"/users/{created_user_id}", headers=headers)
    assert del_res.status_code == 200

def test_bulk_delete_users():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Cria dois usuários no banco
    db = SessionLocal()
    u1_email = f"bulk1_{datetime.now().timestamp()}@vturb.com"
    u2_email = f"bulk2_{datetime.now().timestamp()}@vturb.com"
    try:
        u1 = User(email=u1_email, name="Bulk 1", password_hash=hash_password("Pass@12345678"), role="user", is_super_admin=False)
        u2 = User(email=u2_email, name="Bulk 2", password_hash=hash_password("Pass@12345678"), role="user", is_super_admin=False)
        db.add_all([u1, u2])
        db.commit()
        db.refresh(u1)
        db.refresh(u2)
        u1_id = u1.id
        u2_id = u2.id
    finally:
        db.close()

    # Executa bulk delete dos 2 usuários
    bulk_res = client.post("/users/bulk-delete", headers=headers, json={"ids": [u1_id, u2_id]})
    assert bulk_res.status_code == 200
    data = bulk_res.json()
    assert data["deleted_count"] == 2
    assert u1_id in data["deleted_ids"]
    assert u2_id in data["deleted_ids"]

    # Tentar deletar super admin em lote deve ignorar o super admin
    users_res = client.get("/users/", headers=headers)
    super_admin = next(u for u in users_res.json() if u["email"] == settings.SUPER_ADMIN_EMAIL.lower())
    super_bulk_res = client.post("/users/bulk-delete", headers=headers, json={"ids": [super_admin["id"]]})
    assert super_bulk_res.status_code == 200
    assert super_bulk_res.json()["deleted_count"] == 0

def test_bulk_delete_invites():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Cria dois convites
    r1 = client.post("/users/invites", headers=headers, json={"role": "user", "duration_hours": 24})
    r2 = client.post("/users/invites", headers=headers, json={"role": "admin", "duration_hours": 24})
    inv1_id = r1.json()["id"]
    inv2_id = r2.json()["id"]

    # Bulk delete dos convites
    del_res = client.post("/users/invites/bulk-delete", headers=headers, json={"ids": [inv1_id, inv2_id]})
    assert del_res.status_code == 200
    data = del_res.json()
    assert data["deleted_count"] == 2
    assert inv1_id in data["deleted_ids"]
    assert inv2_id in data["deleted_ids"]

def test_delete_invite():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Gera convite
    res_inv = client.post("/users/invites", headers=headers, json={
        "role": "user",
        "duration_hours": 24
    })
    assert res_inv.status_code == 200
    inv_id = res_inv.json()["id"]

    # Deleta convite com sucesso
    del_res = client.delete(f"/users/invites/{inv_id}", headers=headers)
    assert del_res.status_code == 200
    assert "Convite excluído com sucesso" in del_res.json()["detail"]

    # Tentativa de deletar convite inexistente retorna 404
    del_not_found = client.delete(f"/users/invites/{inv_id}", headers=headers)
    assert del_not_found.status_code == 404

def test_non_super_admin_cannot_access_user_management():
    # Cria usuário não-super admin
    db = SessionLocal()
    non_super_email = f"standard_{datetime.now().timestamp()}@test.com"
    non_super_pass = "TestPassword@1234"
    try:
        user = User(
            email=non_super_email,
            name="Normal User",
            password_hash=hash_password(non_super_pass),
            role="admin",
            is_super_admin=False
        )
        db.add(user)
        db.commit()
    finally:
        db.close()

    # Faz login como o usuário não-super admin
    res_login = client.post("/auth/login", json={
        "email": non_super_email,
        "password": non_super_pass
    })
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Tentativa de listar usuários retorna 403
    r_list = client.get("/users/", headers=headers)
    assert r_list.status_code == 403
    assert "Super Admin" in r_list.json()["detail"]

    # Tentativa de criar convite retorna 403
    r_inv = client.post("/users/invites", headers=headers, json={"role": "user", "duration_hours": 24})
    assert r_inv.status_code == 403

    # Tentativa de listar convites retorna 403
    r_list_inv = client.get("/users/invites", headers=headers)
    assert r_list_inv.status_code == 403

    # Tentativa de deletar convite retorna 403
    r_del_inv = client.delete("/users/invites/fake-id", headers=headers)
    assert r_del_inv.status_code == 403

def test_super_admin_always_at_top_of_list():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/users/", headers=headers)
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 1

    first_user = users[0]
    assert first_user["is_super_admin"] is True
    assert first_user["role"] == "super_admin"
    assert first_user["email"] == settings.SUPER_ADMIN_EMAIL.lower()

def test_update_user_success_and_restrictions():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Cria um usuário comum para teste de edição
    db = SessionLocal()
    unique_ts = int(datetime.now().timestamp())
    test_email = f"editavel_{unique_ts}@teste.com"
    try:
        u = User(
            email=test_email,
            name="Nome Original",
            password_hash=hash_password("OriginalPass123!"),
            role="user",
            is_super_admin=False
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        test_user_id = u.id
    finally:
        db.close()

    # 2. Atualiza nome, e-mail e função para admin com sucesso
    new_email = f"atualizado_{unique_ts}@teste.com"
    put_res = client.put(f"/users/{test_user_id}", headers=headers, json={
        "name": "Nome Atualizado",
        "email": new_email,
        "role": "admin",
        "password": "NovaSenhaForte123!"
    })
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data["name"] == "Nome Atualizado"
    assert updated_data["email"] == new_email
    assert updated_data["role"] == "admin"

    # 3. Tentativa de transformar em super_admin deve ser rejeitada com 400
    put_invalid_role = client.put(f"/users/{test_user_id}", headers=headers, json={
        "role": "super_admin"
    })
    assert put_invalid_role.status_code == 400
    assert "Não é permitido atribuir a função Super Admin" in put_invalid_role.json()["detail"]

    # 4. Tentativa de editar o Super Admin deve ser rejeitada com 400
    users_res = client.get("/users/", headers=headers)
    super_admin = users_res.json()[0]
    put_super = client.put(f"/users/{super_admin['id']}", headers=headers, json={
        "name": "Tentando Alterar Super"
    })
    assert put_super.status_code == 400
    assert "Super Admin oficial não pode ser editado" in put_super.json()["detail"]


def test_trigger_password_reset_success_and_restrictions():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Cria um usuário comum para teste
    db = SessionLocal()
    unique_ts = int(datetime.now().timestamp()) + 999
    test_email = f"resetavel_{unique_ts}@teste.com"
    try:
        u = User(
            email=test_email,
            name="Usuário Reset",
            password_hash=hash_password("AntigaSenha123!"),
            role="user",
            is_super_admin=False
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        target_user_id = u.id
    finally:
        db.close()

    # 2. Super Admin dispara redefinição de senha com sucesso
    reset_res = client.post(f"/users/{target_user_id}/reset-password", headers=headers)
    assert reset_res.status_code == 200
    data = reset_res.json()
    assert data["success"] is True
    assert "token" in data
    assert "/reset-password?token=" in data["reset_url"]

    # 3. Tentativa de redefinir senha do Super Admin deve retornar 400
    users_res = client.get("/users/", headers=headers)
    super_admin = users_res.json()[0]
    res_super = client.post(f"/users/{super_admin['id']}/reset-password", headers=headers)
    assert res_super.status_code == 400
    assert "Não é permitido redefinir a senha do Super Admin" in res_super.json()["detail"]

    # 4. Tentativa de redefinir usuário inexistente retorna 404
    res_404 = client.post("/users/non-existent-id/reset-password", headers=headers)
    assert res_404.status_code == 404

    # 5. Usuário sem permissão (não super admin) recebe 403
    common_login = client.post("/auth/login", json={
        "email": test_email,
        "password": "AntigaSenha123!"
    })
    assert common_login.status_code == 200
    common_token = common_login.json()["access_token"]
    forbidden_res = client.post(
        f"/users/{target_user_id}/reset-password",
        headers={"Authorization": f"Bearer {common_token}"}
    )
    assert forbidden_res.status_code == 403


def test_execute_password_reset_flow():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Cria usuário
    db = SessionLocal()
    unique_ts = int(datetime.now().timestamp()) + 1234
    test_email = f"fluxo_reset_{unique_ts}@teste.com"
    try:
        u = User(
            email=test_email,
            name="Fluxo Reset User",
            password_hash=hash_password("AntigaSenha123!"),
            role="user",
            is_super_admin=False
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        target_user_id = u.id
    finally:
        db.close()

    # 2. Gera token de redefinição
    trigger_res = client.post(f"/users/{target_user_id}/reset-password", headers=headers)
    assert trigger_res.status_code == 200
    reset_token = trigger_res.json()["token"]

    # 3. Valida token via rota pública
    val_res = client.get(f"/auth/validate-reset-token?token={reset_token}")
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["valid"] is True
    assert val_data["email"] == test_email

    # 4. Tentativa de redefinir com senha fraca (<12 caracteres)
    weak_res = client.post("/auth/reset-password", json={
        "token": reset_token,
        "password": "fraca"
    })
    assert weak_res.status_code == 400
    assert "no mínimo 12 caracteres" in weak_res.json()["detail"]

    # 5. Redefine com senha forte válida
    nova_senha = "NovaSenhaForte2026!#"
    exec_res = client.post("/auth/reset-password", json={
        "token": reset_token,
        "password": nova_senha
    })
    assert exec_res.status_code == 200
    assert exec_res.json()["success"] is True

    # 6. O token consumido não pode ser utilizado novamente
    reuse_res = client.post("/auth/reset-password", json={
        "token": reset_token,
        "password": "OutraSenhaForte2026!#"
    })
    assert reuse_res.status_code == 400
    assert "inválido ou expirado" in reuse_res.json()["detail"]

    # 7. Usuário consegue logar com a nova senha
    login_new = client.post("/auth/login", json={
        "email": test_email,
        "password": nova_senha
    })
    assert login_new.status_code == 200
    assert "access_token" in login_new.json()

    # 8. Usuário NÃO consegue logar com a senha antiga
    login_old = client.post("/auth/login", json={
        "email": test_email,
        "password": "AntigaSenha123!"
    })
    assert login_old.status_code == 401

