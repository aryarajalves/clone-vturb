import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, BigInteger
from app.core.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class BackupRecord(Base):
    __tablename__ = "backup_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False, index=True)
    size_bytes = Column(BigInteger, default=0, nullable=False)
    status = Column(String(50), default="completed", nullable=False)  # "completed", "in_progress", "failed"
    storage_path = Column(String(500), nullable=False)
    is_external = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, index=True)

class BackupSchedule(Base):
    __tablename__ = "backup_schedules"

    id = Column(Integer, primary_key=True, default=1)
    is_active = Column(Boolean, default=True, nullable=False)
    frequency = Column(String(50), default="hours", nullable=False)  # "hours", "days", "weekly"
    interval_value = Column(Integer, default=6, nullable=False)
    s3_folder = Column(String(255), default="vturb/backups/", nullable=False)
    retention_limit = Column(Integer, default=30, nullable=False)
    last_backup_at = Column(DateTime(timezone=True), nullable=True)
    next_backup_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
