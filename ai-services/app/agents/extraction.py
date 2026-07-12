from app.state import AgentState

def extraction_agent_node(state: AgentState) -> dict:
    """IOC Extraction node. Extracts network IPs, domains, and files hashes from raw log payloads."""
    print("[Agent Node] Running IOC Extraction...")
    # Scaffolding mock extraction logic
    mock_iocs = [
        {"type": "ip", "value": "192.168.12.14"},
        {"type": "url", "value": "http://malicious-domain.com/payload.ps1"}
    ]
    
    return {
        "extracted_iocs": mock_iocs,
        "completed_steps": state.get("completed_steps", []) + ["ioc_extraction"],
        "current_agent": "threat_intelligence"
    }
