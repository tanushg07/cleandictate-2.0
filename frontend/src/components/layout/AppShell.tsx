"use client";

import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 flex flex-col min-h-screen">
        <div className="flex-1 w-full max-w-5xl mx-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
