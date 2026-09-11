from fastapi.testclient import TestClient
from app.main import app, init_super_admin
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.config import settings

# Inicializa o super admin no banco de dados para os testes
init_super_admin()
client = TestClient(app)

def test_argon2_hashing_and_verification():
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)
    
    # Valida formato Argon2id
    assert hashed.startswith("$argon2id$")
    assert "$m=65536,t=3,p=4$" in hashed
    
    # Valida verificação positiva e negativa
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("", hashed) is False

def test_jwt_token_creation_and_decoding():
    payload = {
        "sub": "user-uuid-123",
        "email": "teste@vturb.com",
        "is_super_admin": True
    }
    token = create_access_token(data=payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == payload["sub"]
    assert decoded["email"] == payload["email"]
    assert decoded["is_super_admin"] is True

    # Token inválido
    assert decode_access_token("invalid.jwt.token") is None

def test_auth_login_endpoints():
    # Login com sucesso usando as credenciais do super admin
    login_payload = {
        "email": settings.SUPER_ADMIN_EMAIL,
        "password": settings.SUPER_ADMIN_PASSWORD
    }
    res = client.post("/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.SUPER_ADMIN_EMAIL.lower()
    assert data["user"]["is_super_admin"] is True

    token = data["access_token"]

    # Teste do endpoint /auth/me com token válido
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == settings.SUPER_ADMIN_EMAIL.lower()
    assert me_data["is_super_admin"] is True

    # Teste de falha: senha incorreta
    wrong_pwd_res = client.post("/auth/login", json={
        "email": settings.SUPER_ADMIN_EMAIL,
        "password": "SenhaCompletamenteIncorreta999"
    })
    assert wrong_pwd_res.status_code == 401
    assert "detail" in wrong_pwd_res.json()

    # Teste de falha: usuário inexistente
    non_existent_res = client.post("/auth/login", json={
        "email": "inexistente_999@naoexiste.com",
        "password": "qualquer_senha"
    })
    assert non_existent_res.status_code == 401

    # Teste /auth/me sem token
    unauth_me = client.get("/auth/me")
    assert unauth_me.status_code == 401

def test_routes_protection_with_jwt():
    # Rota pública /health/ deve funcionar sem token
    health_res = client.get("/health/")
    assert health_res.status_code == 200

    # Rota privada /videos/ deve retornar 401 sem token
    unauth_res = client.get("/videos/")
    assert unauth_res.status_code == 401

    # Rota privada /videos/ deve retornar 200 com token válido
    login_payload = {
        "email": settings.SUPER_ADMIN_EMAIL,
        "password": settings.SUPER_ADMIN_PASSWORD
    }
    login_res = client.post("/auth/login", json=login_payload)
    token = login_res.json()["access_token"]

    auth_res = client.get("/videos/", headers={"Authorization": f"Bearer {token}"})
    assert auth_res.status_code == 200
    assert isinstance(auth_res.json(), list)

def test_jwt_expiration_after_24_hours():
    from datetime import timedelta

    # 1. Valida que a expiração padrão configurada e gerada é exatamente 24 horas (1440 minutos / 86400s)
    payload = {
        "sub": "user-uuid-exp-test",
        "email": settings.SUPER_ADMIN_EMAIL,
        "is_super_admin": True
    }
    token = create_access_token(data=payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    time_diff = decoded["exp"] - decoded["iat"]
    assert time_diff == 24 * 60 * 60

    # 2. Token expirado (simulando requisição após transcorridas 24 horas)
    expired_token = create_access_token(data=payload, expires_delta=timedelta(seconds=-10))

    # decode_access_token deve retornar None para token vencido
    assert decode_access_token(expired_token) is None

    # Endpoint protegido /auth/me deve rejeitar com 401 e mensagem de expirado
    expired_me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert expired_me_res.status_code == 401
    assert "Token inválido ou expirado" in expired_me_res.json()["detail"]

    # Endpoint protegido /videos/ deve rejeitar com 401 e mensagem de expirado
    expired_videos_res = client.get("/videos/", headers={"Authorization": f"Bearer {expired_token}"})
    assert expired_videos_res.status_code == 401
    assert "Token inválido ou expirado" in expired_videos_res.json()["detail"]
