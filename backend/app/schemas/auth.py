from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    name: Optional[str] = None
    role: str = "user"
    is_super_admin: bool
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CreateInviteRequest(BaseModel):
    role: str  # "admin" ou "user"
    duration_hours: int = 24

class InviteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    token: str
    role: str
    expires_at: datetime
    is_used: bool
    used_by_email: Optional[str] = None
    created_at: Optional[datetime] = None
    invite_url: Optional[str] = None

class InviteValidateResponse(BaseModel):
    valid: bool
    role: str
    expires_at: datetime

class RegisterInviteRequest(BaseModel):
    token: str
    email: str
    password: str
    name: Optional[str] = None

