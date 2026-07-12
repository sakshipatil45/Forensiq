"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { apiClient } from "@/services/api-client";
import { 
  Shield, AlertTriangle, Activity, Cpu, 
  Search, Bell, Settings, LogOut, ChevronRight,
  TrendingUp, CircleDot, RefreshCw, Layers, CheckCircle2,
  Copy, Check, User, Server, Key, Eye, EyeOff
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

interface Alert {
  id: string;
  title: string;
  source: string;
  severity: string;
  status: string;
  created_at: string;
  raw_payload: any;
}

// Chart data stubs
const ingestionData = [
  { time: "00:00", alerts: 45 },
  { time: "04:00", alerts: 50 },
  { time: "08:00", alerts: 85 },
  { time: "12:00", alerts: 140 },
  { time: "16:00", alerts: 120 },
  { time: "20:00", alerts: 90 },
  { time: "24:00", alerts: 60 }
];

const severityData = [
  { name: "Low", value: 5, color: "#3b82f6" },
  { name: "Medium", value: 12, color: "#f59e0b" },
  { name: "High", value: 8, color: "#f97316" },
  { name: "Critical", value: 3, color: "#ef4444" }
];

const agentsList = [
  {
    id: "triage",
    name: "Triage & Validation Agent",
    description: "Parses incoming webhook alert payloads, extracts primary attributes, and sanitizes payload structures using Pydantic contracts.",
    status: "idle",
    tools: ["PayloadSanitizer", "Deduplicator"]
  },
  {
    id: "ioc",
    name: "IOC Extraction Agent",
    description: "Extracts Indicators of Compromise (IPs, hashes, domain names, URLs, file paths) using regex engines and LLM-assisted context parsing.",
    status: "idle",
    tools: ["RegexExtractor", "LlmIocParser"]
  },
  {
    id: "intel",
    name: "Threat Intelligence Enricher",
    description: "Enriches extracted threat indicators by querying Virustotal, AbuseIPDB, and ChEMBL repositories for historical reputation scores.",
    status: "idle",
    tools: ["VirusTotalQuery", "AbuseIPDBLookup"]
  },
  {
    id: "mitre",
    name: "MITRE ATT&CK Mapper",
    description: "Correlates attack behaviors, system commands, and malicious payloads against the localized MITRE framework tactics registry.",
    status: "idle",
    tools: ["MitreMatrixSearch", "VectorDbQuery"]
  },
  {
    id: "timeline",
    name: "Timeline Constructor",
    description: "Orders alerts, authentication failures, network flows, and audit logs chronologically to reconstruct a cohesive attack sequence.",
    status: "idle",
    tools: ["ChronologySorter", "StepAggregator"]
  },
  {
    id: "risk",
    name: "Dynamic Risk Evaluator",
    description: "Applies multi-variable risk matrices and weight distributions to calculate final threat credibility and criticality scores.",
    status: "idle",
    tools: ["RiskMatrixCalculator", "SeverityWeightAssigner"]
  },
  {
    id: "reporter",
    name: "Executive Case Reporter",
    description: "Aggregates outputs from all upstream analysis nodes to compile an explainable, enterprise-ready incident markdown log.",
    status: "idle",
    tools: ["MarkdownCompiler", "ReportPublisher"]
  }
];

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("incidents");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Settings view states
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  
  const mockApiKey = "forensiq_super_secure_ingest_key_123";

  const fetchAlerts = async () => {
    setFetching(true);
    setErrorMessage("");
    try {
      const response = await apiClient.get<Alert[]>("/alerts");
      setAlerts(response.data);
    } catch (err: any) {
      console.error("Error fetching alerts:", err);
      setErrorMessage("Could not connect to the alerts service. Verify backend database configurations.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout request failed", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* 1. Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between">
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center px-6 border-b border-border gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-wider text-white">FORENSIQ</span>
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-mono">v1.0</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("incidents")}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === "incidents" ? "bg-primary text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.25)]" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <Activity className="h-4 w-4" />
              <span>Incident Queue</span>
            </button>

            <button
              onClick={() => setActiveTab("intel")}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === "intel" ? "bg-primary text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.25)]" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <Cpu className="h-4 w-4" />
              <span>AI Agents System</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === "settings" ? "bg-primary text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.25)]" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User Session Footer */}
        <div className="p-4 border-t border-border bg-zinc-950/40">
          <div className="mb-4">
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest font-mono">
              {user?.role?.name || "socanalyst"}
            </p>
            <p className="text-xs font-semibold text-white mt-0.5 truncate">{user?.email}</p>
            <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
              {user?.organization?.name || "Default Sandbox Org"}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 border border-zinc-800 hover:border-destructive/30 hover:bg-destructive/10 text-zinc-400 hover:text-destructive py-2 rounded-lg text-xs transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Main View Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header/Navbar */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          {/* Search Box */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/30 py-1.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-700"
                placeholder="Search active tickets, IP addresses, techniques..."
              />
            </div>
          </div>

          {/* Right System Indicators */}
          <div className="flex items-center gap-4">
            {/* Health Indicator */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-[11px] text-emerald-400 font-mono">
              <CircleDot className="h-3 w-3 animate-pulse" />
              <span>Orchestrator Online</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* -------------------- Incidents Queue View -------------------- */}
        {activeTab === "incidents" && (
          <div className="p-8 space-y-8 overflow-y-auto flex-1">
            {/* Headline Banner */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Security Command Center</h2>
                <p className="text-sm text-zinc-400">Manage real-time SIEM alerts and watch AI agent orchestrators triage logs.</p>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                Tenant ID: {user?.org_id}
              </p>
            </div>

            {/* Core Analytics KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl border border-border bg-card/40 cyber-glass flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Alerts count</span>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-white">{alerts.length}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Live database rows</p>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/40 cyber-glass flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ingested Events</span>
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-white">1,245</h3>
                  <p className="text-xs text-zinc-500 mt-1">Avg 52 alerts/hr</p>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/40 cyber-glass flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Running AI Jobs</span>
                  <Cpu className="h-4 w-4 text-purple-400" />
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-white">0</h3>
                  <p className="text-xs text-zinc-500 mt-1">AI Agents inactive</p>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/40 cyber-glass flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">True Positive Rate</span>
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-white">100%</h3>
                  <p className="text-xs text-emerald-400 mt-1">Database connection ok</p>
                </div>
              </div>
            </div>

            {/* Graphics Plots section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 rounded-xl border border-border bg-card/30 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-white">Ingestion Volume (24 Hours)</h4>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>+18% peak rate</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ingestionData}>
                      <defs>
                        <linearGradient id="alertGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#4b5563" fontSize={11} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#090d16", border: "1px solid #1e293b", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#alertGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/30 flex flex-col justify-between">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white">Severity Categorization</h4>
                  <p className="text-xs text-zinc-500">Distribution of active investigations</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityData}>
                      <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                      <Tooltip cursor={false} contentStyle={{ background: "#090d16", border: "1px solid #1e293b", borderRadius: "8px" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Active Incidents Queue Table */}
            <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Investigation Ingest Pipeline</h4>
                  <p className="text-xs text-zinc-500">Active agent workflows and vulnerability summaries</p>
                </div>
                <button 
                  onClick={fetchAlerts} 
                  disabled={fetching}
                  className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${fetching ? "animate-spin" : ""}`} />
                  <span>Sync Database</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-6 text-sm text-destructive text-center bg-destructive/5 border-b border-border">
                  {errorMessage}
                </div>
              )}

              <div className="overflow-x-auto">
                {fetching && alerts.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm font-mono">Querying Forensiq database logs...</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">
                    <Shield className="h-8 w-8 mx-auto mb-3 text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-400">No active alerts in queue</p>
                    <p className="text-xs text-zinc-600 mt-1">Ingest threat telemetry using the Swagger API to trigger analysis.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-border">
                        <th className="py-3 px-6">Alert Details</th>
                        <th className="py-3 px-6">Source</th>
                        <th className="py-3 px-6">Severity</th>
                        <th className="py-3 px-6">AI Agent Status</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-sm">
                      {alerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-semibold text-white">{alert.title}</p>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{alert.id}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-zinc-400 font-mono uppercase">
                            {alert.source}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                              alert.severity === "critical" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                              alert.severity === "high" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                              alert.severity === "medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                              "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            }`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {alert.status === "new" && <CircleDot className="h-3.5 w-3.5 text-zinc-500" />}
                              {alert.status === "investigating" && <CircleDot className="h-3.5 w-3.5 text-purple-400 animate-spin" />}
                              {alert.status === "resolved" && <CircleDot className="h-3.5 w-3.5 text-emerald-400" />}
                              <span className="text-xs capitalize text-zinc-400">
                                {alert.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors">
                              <span>Analyze</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- AI Agents System View -------------------- */}
        {activeTab === "intel" && (
          <div className="p-8 space-y-8 overflow-y-auto flex-1">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">LangGraph Agent Orchestrator</h2>
              <p className="text-sm text-zinc-400">Inspect the multi-agent execution pipeline nodes, status conditions, and functional tools.</p>
            </div>

            {/* Visual Agent Sequence Grid */}
            <div className="p-6 rounded-xl border border-border bg-card/30 space-y-6">
              <h4 className="text-xs uppercase tracking-widest text-primary font-bold font-mono">Agent Graph Pipeline Sequence</h4>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                {agentsList.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    {/* Node */}
                    <div className="border border-zinc-800 bg-zinc-950/50 p-4 rounded-lg text-center space-y-2 relative group hover:border-primary/40 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-xs font-mono">
                        {i + 1}
                      </div>
                      <p className="text-[11px] font-bold text-white truncate">{agent.name.split(" ")[0]}</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest scale-90">
                        {agent.status}
                      </span>
                    </div>
                    {/* Connector Arrow */}
                    {i < agentsList.length - 1 && (
                      <div className="hidden md:flex justify-center text-zinc-700">
                        <ChevronRight className="h-5 w-5 animate-pulse" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Detailed Agent Directory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agentsList.map((agent) => (
                <div key={agent.id} className="p-6 rounded-xl border border-border bg-card/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span>{agent.name}</span>
                      </h3>
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                        <CircleDot className="h-2 w-2 text-emerald-500 animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">{agent.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mr-2">Registered Tools:</span>
                    {agent.tools.map((tool) => (
                      <span key={tool} className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- Settings View -------------------- */}
        {activeTab === "settings" && (
          <div className="p-8 space-y-8 overflow-y-auto flex-1 max-w-4xl">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
              <p className="text-sm text-zinc-400">Manage tenant profiles, user privilege mapping, and ingestion webhook credentials.</p>
            </div>

            {/* Card 1: Org details */}
            <div className="p-6 rounded-xl border border-border bg-card/30 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="h-4.5 w-4.5 text-primary" />
                <span>Tenant & Organization Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-mono uppercase">Organization Name</span>
                  <p className="text-white font-semibold">{user?.organization?.name || "Default Sandbox Org"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-mono uppercase">Tenant Identifier</span>
                  <p className="text-zinc-400 font-mono text-xs">{user?.org_id}</p>
                </div>
              </div>
            </div>

            {/* Card 2: User profile & permissions */}
            <div className="p-6 rounded-xl border border-border bg-card/30 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                <span>User Profile & RBAC Policy</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-500 font-mono uppercase">User Identity</span>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-500 font-mono uppercase">Active Assigned Role</span>
                    <p className="text-primary font-bold tracking-wider font-mono text-xs uppercase">
                      {user?.role?.name || "socanalyst"}
                    </p>
                  </div>
                </div>
                
                {/* Granular permissions checklist */}
                <div className="space-y-3">
                  <span className="text-xs text-zinc-500 font-mono uppercase">Assigned Policy Privileges</span>
                  <div className="space-y-2">
                    {user?.role?.permissions && user.role.permissions.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="font-mono text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{p.name}</span>
                          <span className="text-zinc-500 ml-2 font-light">{p.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Ingestion API keys */}
            <div className="p-6 rounded-xl border border-border bg-card/30 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-primary" />
                  <span>Ingestion Access Keys</span>
                </h3>
                <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono uppercase">
                  Webhook Authenticated
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Use the ingestion API Key in the headers of external logs posting to `/api/v1/alerts/ingest`. Webhook requests require passing the header: <br />
                <span className="font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded mt-2 inline-block">X-API-Key: &lt;API_KEY&gt;</span>
              </p>

              <div className="mt-4 space-y-2 max-w-lg">
                <span className="text-xs text-zinc-500 font-mono uppercase">Active Ingestion API Key</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      readOnly
                      value={mockApiKey}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 py-2 pl-3 pr-10 text-xs text-zinc-300 font-mono outline-none"
                    />
                    <button 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400 px-3 py-2 rounded-md text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
