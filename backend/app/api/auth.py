import re
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.models.user import User, UserInvite
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    InviteValidateResponse,
    RegisterInviteRequest,
)
from app.api.deps import get_current_user

logger = logging.getLogger("projetovturb.auth")
router = APIRouter(prefix="/auth", tags=["Autenticação"])

def validate_strong_password(password: str) -> None:
    """Valida requisitos de senha forte: 12+ caracteres, maiúscula, minúscula, número e caractere especial."""
    if len(password) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve conter no mínimo 12 caracteres."
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve conter pelo menos uma letra maiúscula."
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve conter pelo menos uma letra minúscula."
        )
    if not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve conter pelo menos um número."
        )
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve conter pelo menos um caractere especial (ex: !@#$%^&*)."
        )

def resolve_display_name(user: User, is_super_admin: bool) -> str:
    """Retorna o nome explícito ou formata o nome a partir do e-mail."""
    if user.name and user.name.strip():
        return user.name.strip()
    if is_super_admin:
        return "Super Admin"
    username = user.email.split("@")[0]
    cleaned = username.replace(".", " ").replace("_", " ").replace("-", " ")
    parts = [w.capitalize() for w in cleaned.split()]
    return " ".join(parts) or "Usuário"

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Autentica o usuário pelo e-mail e senha com hash Argon2id e gera JWT de 24h."""
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()

    if not user:
        logger.warning(f"Tentativa de login com e-mail inexistente: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    if not verify_password(payload.password, user.password_hash):
        logger.warning(f"Tentativa de login com senha incorreta para: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    official_email = settings.SUPER_ADMIN_EMAIL.strip().lower()
    user.is_super_admin = (user.email.strip().lower() == official_email)
    if user.is_super_admin:
        user.role = "super_admin"
    elif user.role == "super_admin":
        user.role = "admin"

    access_token = create_access_token(data={
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "is_super_admin": user.is_super_admin
    })

    logger.info(f"Login bem-sucedido para o usuário: {user.email}")
    user_resp = UserResponse.model_validate(user)
    user_resp.name = resolve_display_name(user, user.is_super_admin)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_resp
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado a partir do token JWT."""
    official_email = settings.SUPER_ADMIN_EMAIL.strip().lower()
    if current_user.email.strip().lower() == official_email:
        current_user.is_super_admin = True
        current_user.role = "super_admin"
    else:
        current_user.is_super_admin = False
        if current_user.role == "super_admin":
            current_user.role = "admin"
    resp = UserResponse.model_validate(current_user)
    resp.name = resolve_display_name(current_user, current_user.is_super_admin)
    return resp

@router.get("/invite/{token}", response_model=InviteValidateResponse)
def validate_invite(token: str, db: Session = Depends(get_db)):
    """Valida publicamente se o link de convite é válido e não expirou."""
    invite = db.query(UserInvite).filter(UserInvite.token == token.strip()).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link de convite inválido ou não encontrado."
        )

    if invite.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este link de convite já foi utilizado."
        )

    now_utc = datetime.now(timezone.utc)
    if invite.expires_at < now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este link de convite expirou."
        )

    return InviteValidateResponse(
        valid=True,
        role=invite.role,
        expires_at=invite.expires_at
    )

@router.post("/register-invite", response_model=TokenResponse)
def register_via_invite(payload: RegisterInviteRequest, db: Session = Depends(get_db)):
    """Cadastra um novo usuário via link de convite com validação rigorosa de senha forte."""
    token_clean = payload.token.strip()
    invite = db.query(UserInvite).filter(UserInvite.token == token_clean).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link de convite inválido ou inexistente."
        )

    if invite.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este link de convite já foi utilizado."
        )

    now_utc = datetime.now(timezone.utc)
    if invite.expires_at < now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este link de convite expirou."
        )

    email_clean = payload.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informe um endereço de e-mail válido."
        )

    # Validação estrita da senha forte
    validate_strong_password(payload.password)

    # Verifica duplicidade de e-mail
    existing = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta cadastrada com este e-mail."
        )

    # Cria o usuário com o perfil do convite
    assigned_role = invite.role.lower()
    if assigned_role not in ["admin", "user"]:
        assigned_role = "user"

    user_name = payload.name.strip() if payload.name and payload.name.strip() else None
    new_user = User(
        email=email_clean,
        name=user_name,
        password_hash=hash_password(payload.password),
        role=assigned_role,
        is_super_admin=False,
    )
    db.add(new_user)

    # Marca o convite como utilizado
    invite.is_used = True
    invite.used_by_email = email_clean

    db.commit()
    db.refresh(new_user)

    logger.info(f"Usuário criado via convite: {email_clean} com função '{assigned_role}'")

    access_token = create_access_token(data={
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "is_super_admin": new_user.is_super_admin
    })

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

