from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.repositories.alert import alert_repo
from app.repositories.investigation import investigation_repo
from app.schemas.alert import AlertCreate, AlertResponse, AlertIngest
from app.schemas.investigation import InvestigationResponse
from app.tasks.worker import trigger_investigation

router = APIRouter()

@router.post(
    "/ingest", 
    response_model=InvestigationResponse, 
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(deps.verify_ingest_api_key)]
)
async def ingest_alert(
    *,
    db: AsyncSession = Depends(deps.get_db),
    alert_in: AlertIngest
) -> Any:
    alert_obj = {
        "title": alert_in.title,
        "source": alert_in.source,
        "severity": alert_in.severity,
        "raw_payload": alert_in.payload,
        "status": "new"
    }
    
    # Run alert and investigation writes under a single database transaction context
    async with db.begin():
        db_alert = await alert_repo.create(db, obj_in=alert_obj, commit=False)
        await db.flush() # Populate generated UUID for binding
        
        inv_obj = {
            "alert_id": db_alert.id,
            "status": "queued",
            "risk_score": 0.00
        }
        db_inv = await investigation_repo.create(db, obj_in=inv_obj, commit=False)

    # Reload relation properties for return response validation
    await db.refresh(db_inv)

    # 3. Offload LangGraph analysis to Celery background task
    trigger_investigation.delay(str(db_inv.id))

    return db_inv

@router.get("/", response_model=List[AlertResponse])
async def list_alerts(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    alerts = await alert_repo.get_multi(db, skip=skip, limit=limit)
    return alerts

@router.get("/{id}", response_model=AlertResponse)
async def get_alert(
    id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    alert = await alert_repo.get(db, id=id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert
