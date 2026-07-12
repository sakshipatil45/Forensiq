from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as redis

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.organization import Organization
from app.models.role import Role
from app.models.user import User
from app.repositories.user import user_repo
from app.schemas.user import Token, UserResponse, UserCreate

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate
) -> Any:
    # 1. Check if email already registered
    existing_user = await user_repo.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists in the system.",
        )
    
    # 2. Get or create Organization
    org_result = await db.execute(select(Organization).filter(Organization.name == user_in.org_name))
    org = org_result.scalars().first()
    if not org:
        org = Organization(name=user_in.org_name)
        db.add(org)
        await db.flush() # Populate org.id

    # 3. Retrieve default role (socanalyst)
    role_result = await db.execute(select(Role).filter(Role.name == "socanalyst"))
    role = role_result.scalars().first()
    if not role:
        # Fallback to create role if not seeded
        role = Role(name="socanalyst", description="Security Operations Center Analyst")
        db.add(role)
        await db.flush()

    # 4. Hash password and build User
    hashed_password = security.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        org_id=org.id,
        role_id=role.id,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Reload relation fields
    refreshed_user = await user_repo.get_by_email(db, email=user_in.email)
    return refreshed_user

@router.post("/login", response_model=Token)
async def login(
    response: Response,
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = await user_repo.get_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    
    # Set Refresh Token as an HttpOnly, secure cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax", # suitable for cross-origin local dev Nginx setup
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/" # Restrict path to token refresh/logout calls
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    redis_client: redis.Redis = Depends(deps.get_redis),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token cookie"
        )

    # Check if token is blacklisted in Redis
    blacklisted = await redis_client.get(f"blacklist:{refresh_token}")
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been invalidated"
        )

    # Verify signature
    user_id = security.verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Verify user exists
    user = await user_repo.get(db, id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session"
        )

    # Issue new access token and refresh token rotation
    new_access_token = security.create_access_token(subject=user.id)
    new_refresh_token = security.create_refresh_token(subject=user.id)

    # Blacklist previous refresh token
    remaining_time = security.get_token_remaining_time(refresh_token)
    if remaining_time > 0:
        await redis_client.setex(f"blacklist:{refresh_token}", remaining_time, "invalidated")

    # Set new cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/"
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    redis_client: redis.Redis = Depends(deps.get_redis)
) -> Any:
    if refresh_token:
        # Calculate remaining time and add token to Redis blacklist
        remaining_time = security.get_token_remaining_time(refresh_token)
        if remaining_time > 0:
            await redis_client.setex(f"blacklist:{refresh_token}", remaining_time, "logged_out")
            
    # Clear the Cookie in client browser
    response.delete_cookie(
        key="refresh_token",
        path="/"
    )
    return {"message": "Session terminated successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(deps.get_current_user)) -> Any:
    return current_user
