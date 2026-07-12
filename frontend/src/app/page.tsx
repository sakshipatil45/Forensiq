"use client";

import React from "react";
import Link from "next/link";
import { Shield, Cpu, Activity, Database, CheckCircle2, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-zinc-950 to-black text-white flex flex-col justify-between overflow-hidden">
      
      {/* 1. Navbar */}
      <header className="h-20 border-b border-border/60 bg-black/40 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 md:px-16">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-extrabold tracking-wider text-white text-lg">FORENSIQ</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            Launch Platform
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center max-w-6xl mx-auto relative z-10">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs text-primary font-mono mb-6">
          <Cpu className="h-3.5 w-3.5 animate-pulse" />
          <span>Multi-Agent SOC Automation Engine v1.0</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 leading-tight md:leading-tight max-w-4xl">
          Autonomous Alert Investigation & Incident Analysis
        </h1>

        <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Triage security threats, extract IOCs, map attack patterns to the MITRE ATT&CK matrix, and calculate dynamic risk values automatically with LangGraph agent orchestrators.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            <span>Enter Developer Console</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <a
            href="http://localhost/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-all"
          >
            <Database className="h-4 w-4 text-zinc-500" />
            <span>Interactive Swagger API</span>
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 md:mt-28 w-full text-left">
          {/* Card 1 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md hover:border-zinc-700 transition-all group">
            <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 mb-4 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Continuous Ingestion</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
              Connect Splunk or cloud logs straight to our ingestion endpoint. Instantly validate threat events with Pydantic contracts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md hover:border-zinc-700 transition-all group">
            <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 mb-4 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-lg">LangGraph Coordination</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
              Orchestrate sequential and conditional threat analysis routes using stateful multi-agent execution frameworks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md hover:border-zinc-700 transition-all group">
            <div className="h-10 w-10 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 mb-4 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Granular RBAC Policies</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
              Manage analyst activities using standard role policies, OAuth2 JWT token rotators, and Redis log blacklists.
            </p>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="h-16 border-t border-border/40 bg-zinc-950 px-8 flex items-center justify-between text-xs text-zinc-500">
        <p>© 2026 Forensiq Intelligent Security. Final Year Project.</p>
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Core Architectures Validated</span>
        </p>
      </footer>
    </div>
  );
}
