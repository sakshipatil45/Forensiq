import asyncio
import logging
from celery import Celery
import httpx
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.investigation import Investigation
from app.models.alert import Alert

# Initialize Celery app
celery_app = Celery("forensiq_tasks", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

logger = logging.getLogger(__name__)

async def run_investigation_pipeline(investigation_id: str):
    """Asynchronously runs the investigation using SQLAlchemy and HTTPX calls to AI Service"""
    async with AsyncSessionLocal() as db:
        # 1. Fetch the investigation and associated alert
        db_inv = await db.get(Investigation, uuid.UUID(investigation_id))
        if not db_inv:
            logger.error(f"Investigation {investigation_id} not found in database.")
            return

        db_alert = await db.get(Alert, db_inv.alert_id)
        if not db_alert:
            logger.error(f"Associated Alert {db_inv.alert_id} not found.")
            db_inv.status = "failed"
            await db.commit()
            return

        # Update status to running
        db_inv.status = "running"
        await db.commit()

        try:
            # 2. Call AI Service container running LangGraph pipeline
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/analyze",
                    json={
                        "alert_id": str(db_alert.id),
                        "title": db_alert.title,
                        "source": db_alert.source,
                        "severity": db_alert.severity,
                        "payload": db_alert.raw_payload
                    }
                )
                
            if response.status_code == 200:
                result = response.json()
                # 3. Save investigation results
                db_inv.status = "completed"
                db_inv.risk_score = result.get("dynamic_risk_score", 50.00)
                db_inv.report_markdown = result.get("markdown_report", "# Summary\nInvestigation completed.")
                db_inv.completed_at = datetime.now(timezone.utc)
            else:
                logger.error(f"AI Service returned code {response.status_code}: {response.text}")
                db_inv.status = "failed"
                
        except Exception as e:
            logger.exception(f"Exception during investigation {investigation_id}")
            db_inv.status = "failed"

        await db.commit()

@celery_app.task(name="tasks.trigger_investigation")
def trigger_investigation(investigation_id: str):
    """Sync wrapper task for Celery daemon ensuring block-level execution wait"""
    logger.info(f"Starting Celery background analysis for: {investigation_id}")
    
    # Establish a fresh loop context to prevent background task overlap and trace lifecycle
    loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_investigation_pipeline(investigation_id))
    except Exception as e:
        logger.error(f"Execution failed inside analysis loop context: {e}")
        raise e
    finally:
        loop.close()
