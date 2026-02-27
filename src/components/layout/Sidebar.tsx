"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Bell,
  CreditCard,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Send Notification", href: "/send", icon: Send },
  { name: "Email Logs", href: "/email-logs", icon: Mail },
  { name: "SMS Logs", href: "/sms-logs", icon: MessageSquare },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Admin", href: "/admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-card border-r border-border z-30 transition-all duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border transition-colors duration-300">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">NotifyHub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-30 px-2 py-2 transition-all duration-300">
        <div className="flex items-center justify-around">
          {navigation.slice(0, 5).map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate max-w-[60px]">{item.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
