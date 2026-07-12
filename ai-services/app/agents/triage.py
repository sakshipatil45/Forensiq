from app.state import AgentState

def triage_agent_node(state: AgentState) -> dict:
    """Triage node. Evaluates whether the alert requires further investigation."""
    print("[Agent Node] Running Alert Triage...")
    # Scaffolding logical triage check
    is_true_pos = True
    reason = "Suspicious process execution parameters detected in payload command."
    
    return {
        "is_true_positive": is_true_pos,
        "triage_reason": reason,
        "completed_steps": state.get("completed_steps", []) + ["alert_triage"],
        "current_agent": "ioc_extraction"
    }
