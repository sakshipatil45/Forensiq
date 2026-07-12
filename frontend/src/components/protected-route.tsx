"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black text-white">
        <div className="text-center space-y-4">
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-mono animate-pulse">Establishing Secure Session</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">Checking system authority nodes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render children only if user is authorized
  return isAuthenticated ? <>{children}</> : null;
}
