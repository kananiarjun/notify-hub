"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({ message = "Something went wrong", onRetry }: ErrorCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-red-500/20 text-red-400 hover:bg-red-500/10">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
