from langgraph.graph import StateGraph, START, END
from app.state import AgentState

# Import node functions
from app.agents.triage import triage_agent_node
from app.agents.extraction import extraction_agent_node
from app.agents.threat_intel import threat_intel_agent_node
from app.agents.mitre_map import mitre_mapping_agent_node
from app.agents.timeline import timeline_agent_node
from app.agents.risk_calc import risk_assessment_agent_node
from app.agents.report_gen import report_generation_agent_node

# Conditional routing helper
def should_continue_investigation(state: AgentState):
    """If triage decides it is a false positive, skip to report generation."""
    if state.get("is_true_positive") is False:
        return "report_generation"
    return "ioc_extraction"

# Build Graph
builder = StateGraph(AgentState)

# 1. Add Nodes
builder.add_node("alert_triage", triage_agent_node)
builder.add_node("ioc_extraction", extraction_agent_node)
builder.add_node("threat_intelligence", threat_intel_agent_node)
builder.add_node("mitre_mapping", mitre_mapping_agent_node)
builder.add_node("timeline_reconstruction", timeline_agent_node)
builder.add_node("risk_assessment", risk_assessment_agent_node)
builder.add_node("report_generation", report_generation_agent_node)

# 2. Add Transitions
builder.add_edge(START, "alert_triage")

# Triage conditional routing
builder.add_conditional_edges(
    "alert_triage",
    should_continue_investigation,
    {
        "ioc_extraction": "ioc_extraction",
        "report_generation": "report_generation"
    }
)

builder.add_edge("ioc_extraction", "threat_intelligence")
builder.add_edge("threat_intelligence", "mitre_mapping")
builder.add_edge("mitre_mapping", "timeline_reconstruction")
builder.add_edge("timeline_reconstruction", "risk_assessment")
builder.add_edge("risk_assessment", "report_generation")
builder.add_edge("report_generation", END)

# Compile Graph
investigation_graph = builder.compile()
