from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    alert_id: str
    title: str
    source: str
    severity: str
    payload: Dict[str, Any]
    
    # Enrichments populated by agents
    is_true_positive: Optional[bool]
    triage_reason: Optional[str]
    extracted_iocs: List[Dict[str, Any]]
    threat_intel_enrichments: Dict[str, Any]
    mitre_attack_mappings: List[Dict[str, Any]]
    timeline_events: List[Dict[str, Any]]
    
    # Aggregates
    dynamic_risk_score: float
    markdown_report: str
    
    # Telemetry
    completed_steps: List[str]
    current_agent: str
    errors: List[str]
