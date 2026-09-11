import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from app.core.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "super_admin", "admin", "user"
    is_super_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class UserInvite(Base):
    __tablename__ = "user_invites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    token = Column(String(64), unique=True, nullable=False, index=True)
    role = Column(String(50), nullable=False)  # "admin", "user"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    used_by_email = Column(String(255), nullable=True)
    created_by_user_id = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
