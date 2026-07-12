from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from sqlalchemy.orm import selectinload
from app.models.role import Role
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(
            select(User)
            .filter(User.email == email)
            .options(
                selectinload(User.role).selectinload(Role.permissions),
                selectinload(User.organization)
            )
        )
        return result.scalars().first()

user_repo = UserRepository()
