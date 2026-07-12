import "./globals.css";
import React from "react";
import { AuthProvider } from "@/context/auth-context";

export const metadata = {
  title: "Forensiq — AI Security Operations Platform",
  description: "Automated multi-agent investigation system for enterprise SOC alerts triage and MITRE ATT&CK intelligence mapping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
