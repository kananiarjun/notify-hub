"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, ChevronRight, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/send": "Send Notification",
  "/email-logs": "Email Logs",
  "/sms-logs": "SMS Logs",
  "/templates": "Templates",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [commandOpen, setCommandOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const breadcrumbs = [
    { name: "NotifyHub", href: "/" },
    ...(pathname !== "/" ? [{ name: routeNames[pathname] || "Page", href: pathname }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-6 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
              <span className={cn(
                "transition-colors",
                i === breadcrumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              )}>
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-muted-foreground w-64 justify-start border-border bg-secondary/50 hover:bg-secondary transition-all"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
              ⌘K
            </kbd>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                  2
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card border-border shadow-2xl p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Notifications</h4>
                  <Badge variant="secondary" className="text-[10px]">2 New</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10 group hover:bg-destructive/10 transition-colors">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-destructive animate-pulse-dot" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">sarah@company.co — Password Reset</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">SMTP connection timeout — 20 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10 group hover:bg-destructive/10 transition-colors">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-destructive animate-pulse-dot" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">lisa@agency.com — Welcome</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Recipient rejected — 4 hrs ago</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary/80 hover:bg-primary/5 h-8">
                  View All Notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full flex items-center justify-center p-0 hover:bg-secondary">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback className="bg-secondary text-primary font-bold">
                    {session?.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border shadow-2xl" align="end" forceMount>
              <div className="flex items-center justify-start gap-3 p-3">
                <div className="flex flex-col space-y-1">
                  {session?.user?.name && (
                    <p className="font-bold text-sm text-foreground">{session.user.name}</p>
                  )}
                  {session?.user?.email && (
                    <p className="w-[180px] truncate text-xs text-muted-foreground">{session.user.email}</p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => router.push("/settings")} className="p-2.5 text-muted-foreground focus:text-foreground focus:bg-secondary cursor-pointer transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleSignOut} className="p-2.5 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
