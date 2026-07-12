"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Shield, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("analyst@forensiq.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to connect to security gateway. Verify services are running.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black p-4 text-white">
      {/* Outer Cyber Box Glow */}
      <div className="relative w-full max-w-md rounded-xl p-8 cyber-glass shadow-[0_0_50px_rgba(59,130,246,0.15)]">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Shield className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">FORENSIQ</h1>
          <p className="mt-2 text-sm text-zinc-400">Intelligent Security Operations & Investigation</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-primary/50 focus:bg-zinc-900 focus:ring-1 focus:ring-primary/30"
                placeholder="analyst@forensiq.ai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-primary/50 focus:bg-zinc-900 focus:ring-1 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Initialize Session"
            )}
          </button>
        </form>

        {/* Demo Notification Label */}
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Developer Environment</p>
          <p className="mt-1 text-xs text-zinc-400">
            Use pre-seeded sandbox credentials:<br />
            <span className="font-mono text-zinc-200">analyst@forensiq.ai</span> / <span className="font-mono text-zinc-200">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
