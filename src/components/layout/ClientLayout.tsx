"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground transition-all duration-300">
        <Sidebar />
        <div className="lg:pl-60 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 pb-20 lg:pb-6 overflow-y-auto">{children}</main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
