from app.state import AgentState

def threat_intel_agent_node(state: AgentState) -> dict:
    """Threat Intelligence node. Queries reputation scores for target IOCs."""
    print("[Agent Node] Running Threat Intelligence enrichment...")
    # Scaffolding mock API query enrichments
    mock_enrichments = {
        "192.168.12.14": {
            "reputation": "malicious",
            "score": 98,
            "source": "AbuseIPDB"
        },
        "http://malicious-domain.com/payload.ps1": {
            "reputation": "malicious",
            "positives": 45,
            "total": 72,
            "source": "VirusTotal"
        }
    }
    
    return {
        "threat_intel_enrichments": mock_enrichments,
        "completed_steps": state.get("completed_steps", []) + ["threat_intelligence"],
        "current_agent": "mitre_mapping"
    }
