from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from enum import Enum

class InvestigationStatusEnum(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class InvestigationBase(BaseModel):
    alert_id: UUID
    status: InvestigationStatusEnum = Field(default=InvestigationStatusEnum.QUEUED, description="Lifecycle status of agent triage")
    risk_score: float = Field(default=0.00, ge=0.00, le=100.00, description="Calculated dynamic threat score value")
    report_markdown: Optional[str] = Field(default=None, description="Detailed analysis output markdown report")

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationResponse(InvestigationBase):
    id: UUID
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
