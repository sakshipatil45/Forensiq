from app.state import AgentState

def report_generation_agent_node(state: AgentState) -> dict:
    """Report Generation node. Compiles investigation results into a markdown document."""
    print("[Agent Node] Running Report Generation...")
    
    mock_report = f"""# 🛡️ Forensiq Automated Incident Report
## Incident Title: {state.get('title', 'Unknown Alert')}

### 📊 Threat Severity Summary
- **Calculated Risk Index**: **85.50 / 100 (HIGH)**
- **Triage Decision**: **True Positive**
- **Trigger Source**: {state.get('source', 'Unknown')}
- **Context Reason**: {state.get('triage_reason', 'None')}

### 🔍 Extracted Indicators of Compromise (IOCs)
1. **IP Target**: `192.168.12.14` (Reputation: Malicious via AbuseIPDB)
2. **Download URL**: `http://malicious-domain.com/payload.ps1` (Reputation: Malicious via VirusTotal)

### 🧩 MITRE ATT&CK Mapping
*   **Tactic**: **Execution**
*   **Technique**: `T1059.001` (Command and Scripting Interpreter: PowerShell)
*   **Confidence**: 95.00%

### 📅 Chronological Timeline
1. `15:10:00` - User db_service_admin authenticated successfully on SQL-01.
2. `15:10:02` - process powershell.exe bypasses system execution policies.
3. `15:10:05` - SQL-01 initiates connection to remote malicious domain.

---
*Report automatically compiled by Forensiq Multi-Agent Orchestrator.*
"""
    
    return {
        "markdown_report": mock_report,
        "completed_steps": state.get("completed_steps", []) + ["report_generation"],
        "current_agent": "end"
    }
