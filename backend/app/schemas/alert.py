from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Dict, Any
from enum import Enum

class SeverityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Alert summary title")
    source: str = Field(..., min_length=1, max_length=100, description="Source of log (e.g. Wazuh, Splunk)")
    severity: SeverityEnum = Field(default=SeverityEnum.MEDIUM, description="Alert severity valuation")
    raw_payload: Dict[str, Any] = Field(..., description="Raw SIEM JSON context details")

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: UUID
    status: str = Field(..., max_length=50)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AlertIngest(BaseModel):
    source: str = Field(..., min_length=1, max_length=100)
    event_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    severity: SeverityEnum = SeverityEnum.MEDIUM
    timestamp: datetime
    payload: Dict[str, Any]
