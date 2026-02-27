"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, keywords: "home overview stats" },
  { name: "Send Notification", href: "/send", icon: Send, keywords: "compose create email sms" },
  { name: "Email Logs", href: "/email-logs", icon: Mail, keywords: "email history sent" },
  { name: "SMS Logs", href: "/sms-logs", icon: MessageSquare, keywords: "sms text messages" },
  { name: "Templates", href: "/templates", icon: FileText, keywords: "templates content" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, keywords: "charts metrics reports" },
  { name: "Settings", href: "/settings", icon: Settings, keywords: "config preferences" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = pages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.keywords.includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 py-3.5 outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-zinc-800 px-1.5 font-mono text-[10px] text-zinc-400">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2 px-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No results found</p>
          ) : (
            filtered.map((page, i) => (
              <button
                key={page.href}
                onClick={() => navigate(page.href)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  i === selectedIndex ? "bg-white/5 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <page.icon className="w-4 h-4 shrink-0" />
                {page.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
