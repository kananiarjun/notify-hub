"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <Toaster />
    </div>
  );
}
