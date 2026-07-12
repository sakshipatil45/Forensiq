from typing import Optional, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.investigation import Investigation
from app.repositories.base import BaseRepository

class InvestigationRepository(BaseRepository[Investigation]):
    def __init__(self):
        super().__init__(Investigation)

    async def get_by_alert_id(self, db: AsyncSession, alert_id: Any) -> Optional[Investigation]:
        result = await db.execute(select(Investigation).filter(Investigation.alert_id == alert_id))
        return result.scalars().first()

investigation_repo = InvestigationRepository()
