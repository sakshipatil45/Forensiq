from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine
from app.core.security import get_password_hash
from app.models.base import Base
from app.models.organization import Organization
from app.models.role import Role, Permission
from app.models.user import User
from app.models.audit import AuditLog
from app.api.v1 import auth, alerts

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    async with AsyncSessionLocal() as session:
        try:
            # 1. Seed Permissions
            permissions_def = {
                "read:alerts": "Permission to view security alerts and investigation data",
                "write:alerts": "Permission to alter alert status and manually triage investigations",
                "manage:users": "Permission to manage organizational user accounts and settings"
            }
            
            db_permissions = {}
            for perm_name, perm_desc in permissions_def.items():
                perm_result = await session.execute(select(Permission).filter(Permission.name == perm_name))
                perm = perm_result.scalars().first()
                if not perm:
                    perm = Permission(name=perm_name, description=perm_desc)
                    session.add(perm)
                    await session.flush()
                db_permissions[perm_name] = perm
            
            # 2. Seed Roles
            roles_def = {
                "readonly": ["read:alerts"],
                "socanalyst": ["read:alerts", "write:alerts"],
                "orgadmin": ["read:alerts", "write:alerts", "manage:users"]
            }
            
            db_roles = {}
            for role_name, perm_list in roles_def.items():
                role_result = await session.execute(
                    select(Role)
                    .filter(Role.name == role_name)
                    .options(selectinload(Role.permissions))
                )
                role = role_result.scalars().first()
                if not role:
                    role = Role(name=role_name, description=f"{role_name.capitalize()} Role")
                    role.permissions = [db_permissions[p] for p in perm_list]
                    session.add(role)
                else:
                    role.permissions = [db_permissions[p] for p in perm_list]
                
                db_roles[role_name] = role
                await session.flush()
            
            # 3. Seed default Organization
            org_result = await session.execute(select(Organization).filter(Organization.name == "Default Sandbox Org"))
            org = org_result.scalars().first()
            if not org:
                org = Organization(name="Default Sandbox Org")
                session.add(org)
                await session.flush()
            
            # 4. Seed default User (analyst@forensiq.ai)
            user_result = await session.execute(select(User).filter(User.email == "analyst@forensiq.ai"))
            user = user_result.scalars().first()
            if not user:
                logger.info("No default analyst account found. Seeding default User...")
                user = User(
                    email="analyst@forensiq.ai",
                    password_hash=get_password_hash("password123"),
                    org_id=org.id,
                    role_id=db_roles["socanalyst"].id,
                    is_active=True
                )
                session.add(user)
            
            await session.commit()
            logger.info("Database seeding tasks completed successfully.")
            
        except Exception:
            logger.exception("Error seeding database schemas:")
            await session.rollback()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute table creation and seeding on boot
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST Endpoint Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Alerts"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-backend"}

# Real-time WebSocket connection hub
@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established with client.")
    try:
        while True:
            # Echo WebSocket messages
            data = await websocket.receive_text()
            await websocket.send_text(f"Event payload received: {data}")
    except WebSocketDisconnect:
        logger.info("WebSocket connection disconnected by client.")
