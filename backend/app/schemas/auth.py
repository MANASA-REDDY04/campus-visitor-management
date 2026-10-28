from pydantic import BaseModel
from typing import Optional
from app.models.enums import UserRole


class LoginRequest(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    id: str
    username: str
    name: str
    role: UserRole


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserInfo] = None
    token: Optional[str] = None
