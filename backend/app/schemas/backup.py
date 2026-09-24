from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class BackupRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    size_bytes: int
    status: str
    storage_path: str
    is_external: bool
    created_at: datetime

class BackupScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    frequency: str
    interval_value: int
    s3_folder: str
    retention_limit: int
    last_backup_at: Optional[datetime] = None
    next_backup_at: Optional[datetime] = None
    updated_at: datetime

class UpdateScheduleRequest(BaseModel):
    is_active: bool = True
    frequency: str = Field(default="hours", description="'hours', 'days', 'weekly'")
    interval_value: int = Field(default=6, ge=1, le=720)
    s3_folder: str = Field(default="vturb/backups/")
    retention_limit: int = Field(default=30, ge=1, le=1000)

class BackupMetricsResponse(BaseModel):
    last_backup_filename: Optional[str] = None
    last_backup_at: Optional[datetime] = None
    next_backup_at: Optional[datetime] = None
    frequency_text: str = "A cada 6 hora(s)"
    retention_limit: int = 30
    total_backups: int = 0
    storage_configured: bool = False
    storage_message: Optional[str] = None

class BulkDeleteBackupsRequest(BaseModel):
    ids: List[str]

class BulkDeleteBackupsResponse(BaseModel):
    deleted_count: int
    deleted_ids: List[str]
