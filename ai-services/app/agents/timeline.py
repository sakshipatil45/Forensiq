from app.state import AgentState

def timeline_agent_node(state: AgentState) -> dict:
    """Timeline Reconstruction node. Aggregates logs chronologically."""
    print("[Agent Node] Running Timeline Reconstruction...")
    # Scaffolding mock timeline events
    mock_timeline = [
        {
            "timestamp": "2026-07-11T15:10:00Z",
            "event_source": "Active Directory",
            "description": "User db_service_admin authenticated successfully on SQL-01."
        },
        {
            "timestamp": "2026-07-11T15:10:02Z",
            "event_source": "Windows Event Logger",
            "description": "Process powershell.exe spawned by db_service_admin bypasses system execution policies."
        },
        {
            "timestamp": "2026-07-11T15:10:05Z",
            "event_source": "Network Firewalls",
            "description": "Connection request initiated from SQL-01 to remote host malicious-domain.com."
        }
    ]
    
    return {
        "timeline_events": mock_timeline,
        "completed_steps": state.get("completed_steps", []) + ["timeline_reconstruction"],
        "current_agent": "risk_assessment"
    }
