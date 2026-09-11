import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.api.deps import get_current_user

logger = logging.getLogger("projetovturb.auth")
router = APIRouter(prefix="/auth", tags=["Autenticação"])

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

    access_token = create_access_token(data={
        "sub": user.id,
        "email": user.email,
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
    return UserResponse.model_validate(current_user)
