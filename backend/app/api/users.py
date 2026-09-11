import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserInvite
from app.schemas.auth import (
    UserResponse,
    CreateInviteRequest,
    InviteResponse,
    BulkDeleteRequest,
    BulkDeleteResponse,
)

logger = logging.getLogger("projetovturb.users")
router = APIRouter(prefix="/users", tags=["Gestão de Usuários"])

def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    """Valida se o usuário autenticado é estritamente o Super Admin oficial."""
    official_email = settings.SUPER_ADMIN_EMAIL.strip().lower()
    is_official = (
        current_user.email.strip().lower() == official_email or
        current_user.is_super_admin is True
    )
    if not is_official:
        logger.warning(f"Acesso negado à Gestão de Usuários para {current_user.email} (não é Super Admin)")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito exclusivamente ao Super Admin."
        )
    return current_user

@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Lista todos os usuários cadastrados no sistema, garantindo um único SuperAdmin oficial."""
    users = db.query(User).order_by(User.created_at.asc()).all()
    official_email = settings.SUPER_ADMIN_EMAIL.strip().lower()

    for u in users:
        if u.email.strip().lower() == official_email:
            u.role = "super_admin"
            u.is_super_admin = True
            if not u.name:
                u.name = "Super Admin"
        else:
            if u.is_super_admin or u.role == "super_admin":
                u.is_super_admin = False
                u.role = "admin"
    return users

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Exclui um usuário do sistema. O SuperAdmin NUNCA pode ser excluído."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    if user.is_super_admin or user.role == "super_admin":
        logger.warning(f"Tentativa bloqueada de excluir Super Admin ({user.email}) por {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O Super Admin não pode ser excluído."
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode excluir sua própria conta."
        )

    user_email = user.email
    db.delete(user)
    db.commit()
    logger.info(f"Usuário {user_email} excluído com sucesso por {current_user.email}")
    return {"detail": f"Usuário {user_email} excluído com sucesso."}

@router.post("/invites", response_model=InviteResponse)
def create_invite(
    payload: CreateInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Gera um link de convite para um novo usuário (Admin ou Usuário) com tempo de expiração."""
    role_normalized = payload.role.strip().lower()
    if role_normalized not in ["admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Perfil de convite inválido. Apenas 'admin' e 'user' são permitidos. SuperAdmin não pode ser criado via convite."
        )

    if payload.duration_hours <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O tempo de expiração do convite deve ser maior que zero."
        )

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=payload.duration_hours)

    invite = UserInvite(
        token=token,
        role=role_normalized,
        expires_at=expires_at,
        is_used=False,
        created_by_user_id=current_user.id,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    logger.info(f"Convite gerado para role '{role_normalized}' com expiração em {expires_at} por {current_user.email}")

    response = InviteResponse.model_validate(invite)
    response.invite_url = f"/invite/{token}"
    return response

@router.get("/invites", response_model=List[InviteResponse])
def list_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Lista todos os convites gerados e seus status."""
    invites = db.query(UserInvite).order_by(UserInvite.created_at.desc()).all()
    results = []
    for inv in invites:
        item = InviteResponse.model_validate(inv)
        item.invite_url = f"/invite/{inv.token}"
        results.append(item)
    return results

@router.delete("/invites/{invite_id}")
def delete_invite(
    invite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Exclui um link de convite."""
    invite = db.query(UserInvite).filter(UserInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Convite não encontrado."
        )
    db.delete(invite)
    db.commit()
    logger.info(f"Convite {invite_id} excluído com sucesso por {current_user.email}")
    return {"detail": "Convite excluído com sucesso."}

@router.post("/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_users(
    payload: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Exclui múltiplos usuários de uma só vez, protegendo o SuperAdmin e o usuário logado."""
    if not payload.ids:
        return BulkDeleteResponse(deleted_count=0, deleted_ids=[])

    official_email = settings.SUPER_ADMIN_EMAIL.strip().lower()
    users_to_delete = db.query(User).filter(User.id.in_(payload.ids)).all()
    deleted_ids = []

    for u in users_to_delete:
        if u.is_super_admin or u.role == "super_admin" or u.email.strip().lower() == official_email:
            continue
        if u.id == current_user.id:
            continue
        deleted_ids.append(u.id)
        db.delete(u)

    db.commit()
    logger.info(f"{len(deleted_ids)} usuários excluídos em massa por {current_user.email}")
    return BulkDeleteResponse(deleted_count=len(deleted_ids), deleted_ids=deleted_ids)

@router.post("/invites/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_invites(
    payload: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Exclui múltiplos convites de uma só vez."""
    if not payload.ids:
        return BulkDeleteResponse(deleted_count=0, deleted_ids=[])

    invites_to_delete = db.query(UserInvite).filter(UserInvite.id.in_(payload.ids)).all()
    deleted_ids = [inv.id for inv in invites_to_delete]

    for inv in invites_to_delete:
        db.delete(inv)

    db.commit()
    logger.info(f"{len(deleted_ids)} convites excluídos em massa por {current_user.email}")
    return BulkDeleteResponse(deleted_count=len(deleted_ids), deleted_ids=deleted_ids)

