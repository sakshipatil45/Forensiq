from fastapi import FastAPI, HTTPException
import logging
from pydantic import BaseModel
from typing import Dict, Any

from app.state import AgentState
from app.graph import investigation_graph

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Forensiq AI Agent Service", version="1.0.0")

class AnalysisRequest(BaseModel):
    alert_id: str
    title: str
    source: str
    severity: str
    payload: Dict[str, Any]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-services"}

@app.post("/analyze")
async def run_investigation(request: AnalysisRequest):
    logger.info(f"AI Service received investigation request for alert: {request.alert_id}")
    
    # Initialize LangGraph state
    initial_state = AgentState(
        alert_id=request.alert_id,
        title=request.title,
        source=request.source,
        severity=request.severity,
        payload=request.payload,
        is_true_positive=None,
        triage_reason=None,
        extracted_iocs=[],
        threat_intel_enrichments={},
        mitre_attack_mappings=[],
        timeline_events=[],
        dynamic_risk_score=0.00,
        markdown_report="",
        completed_steps=[],
        current_agent="alert_triage",
        errors=[]
    )
    
    try:
        # Run synchronous graph invocation (simplifies Docker runtime context)
        final_state = investigation_graph.invoke(initial_state)
        logger.info(f"Investigation completed successfully for alert {request.alert_id}")
        return final_state
    except Exception as e:
        logger.exception(f"Error running investigation graph for alert {request.alert_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
