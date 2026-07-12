from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class OrganizationSchema(BaseModel):
    id: UUID
    name: str
    class Config:
        from_attributes = True

class PermissionSchema(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class RoleSchema(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    permissions: list[PermissionSchema] = []
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    org_name: Optional[str] = "Default Organization"

class UserResponse(UserBase):
    id: UUID
    org_id: UUID
    role_id: UUID
    created_at: datetime
    updated_at: datetime
    organization: Optional[OrganizationSchema] = None
    role: Optional[RoleSchema] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
