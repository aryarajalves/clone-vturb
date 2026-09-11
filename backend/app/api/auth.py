import re
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

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

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Autentica o usuário validando a senha com Argon2id e retornando o token JWT."""
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_clean).first()

    if not user or not verify_password(payload.password, user.password_hash):
        logger.warning(f"Tentativa de login falhou para o e-mail: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    # Assegura que super admin tenha role super_admin
    if user.is_super_admin and user.role != "super_admin":
        user.role = "super_admin"

    access_token = create_access_token(data={
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "is_super_admin": user.is_super_admin
    })

    logger.info(f"Login bem-sucedido para o usuário: {user.email}")
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado a partir do token JWT."""
    if current_user.is_super_admin and current_user.role != "super_admin":
        current_user.role = "super_admin"
    return UserResponse.model_validate(current_user)

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

    new_user = User(
        email=email_clean,
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

