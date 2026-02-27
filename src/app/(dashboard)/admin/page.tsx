"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, 
  RefreshCw, 
  Hand, 
  Edit, 
  Users, 
  Shield, 
  Mail, 
  MessageSquare, 
  Search, 
  Filter,
  MoreVertical,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type UserData = {
  id: string;
  email: string;
  plan: string;
  role: string;
  emailUsed: number;
  smsUsed: number;
  isActive: boolean;
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Unauthorized Access: Administrative privileges required.");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePlan = async (userId: string) => {
    const newPlan = window.prompt("Modify subscription (FREE, BASIC, PREMIUM):");
    if (!newPlan) return;
    if (!["FREE", "BASIC", "PREMIUM"].includes(newPlan.toUpperCase())) {
      toast({ title: "Validation Error", description: "Invalid subscription tier selected.", variant: "destructive" });
      return;
    }
    
    try {
      await fetch("/api/admin/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPlan: newPlan.toUpperCase() })
      });
      toast({ title: "Manifest Updated", description: `User subscription upgraded to ${newPlan.toUpperCase()}.` });
      fetchUsers();
    } catch {
      toast({ title: "Operation Failed", description: "Terminal error in plan synchronization.", variant: "destructive" });
    }
  };

  const handleResetUsage = async (userId: string) => {
    if (!window.confirm("Initialize usage metrics reset for this node?")) return;
    try {
      await fetch("/api/admin/reset-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      toast({ title: "Metrics Initialized", description: "All usage counters have been zeroed." });
      fetchUsers();
    } catch {
      toast({ title: "Operation Failed", description: "Usage initialization sequence failed.", variant: "destructive" });
    }
  };

  const handleToggleUser = async (userId: string, active: boolean) => {
    try {
      await fetch("/api/admin/toggle-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      toast({ 
        title: active ? "Access Revoked" : "Access Restored", 
        description: `User authorization state toggled successfully.`,
        variant: active ? "destructive" : "default" 
      });
      fetchUsers();
    } catch {
      toast({ title: "Operation Failed", description: "Authorization state change failed.", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Command Console...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto gap-6">
          <div className="p-6 rounded-[2.5rem] bg-destructive/10 border border-destructive/20 text-destructive">
             <Shield className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Security Protocol Breach</h2>
            <p className="text-sm text-muted-foreground font-medium">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl px-8 font-black">
            Re-Authorize Session
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        {/* Advanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-50 group-hover:bg-primary/40 transition-all" />
              <div className="relative p-4 rounded-[2rem] bg-card border border-primary/20 text-primary shadow-2xl transition-transform group-hover:-translate-y-1">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-foreground tracking-tighter">Command Center</h1>
                <Badge variant="outline" className="h-6 px-2 font-black border-primary/20 bg-primary/5 text-primary">ADMIN v4.0</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm font-medium">Elevated authority module for global user synchronization and node monitoring.</p>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="h-12 rounded-[1.2rem] px-6 font-black border-border bg-card/50 hover:bg-card shadow-sm transition-all" onClick={fetchUsers} disabled={refreshing}>
               <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
               Sync Nodes
             </Button>
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Master Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-64 rounded-[1.2rem] pl-11 bg-card/30 border-border focus-visible:ring-primary font-bold shadow-inner"
                />
             </div>
          </div>
        </div>

        {/* User Intelligence Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              variants={staggerItem}
              className="group relative"
            >
              <div className={cn(
                "absolute inset-0 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-10 transition-opacity",
                user.isActive ? "bg-primary" : "bg-destructive"
              )} />
              <div className="relative bg-card border border-border rounded-[2.8rem] p-8 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={cn(
                        "w-14 h-14 rounded-[1.3rem] flex items-center justify-center text-lg font-black shadow-lg ring-4 ring-background",
                        user.isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {user.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-card shadow-sm",
                        user.isActive ? "bg-emerald-500" : "bg-destructive"
                      )} />
                    </div>
                    <div>
                      <p className="font-black text-foreground break-all max-w-[140px] leading-tight mb-1">{user.email}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border bg-muted/30">{user.plan}</Badge>
                        {user.role === "ADMIN" && (
                          <Badge className="bg-primary/20 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest">ADMIN ROOT</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-muted/50">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[200px] shadow-2xl">
                      <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-3 py-2">Authority Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleUpdatePlan(user.id)} className="rounded-xl p-3 font-bold gap-3 group/item">
                        <div className="p-1.5 rounded-lg bg-secondary group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </div>
                        Modify Credits
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetUsage(user.id)} className="rounded-xl p-3 font-bold gap-3 group/item">
                        <div className="p-1.5 rounded-lg bg-secondary group-hover/item:bg-blue-500/20 group-hover/item:text-blue-500 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        Reset Telemetry
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem 
                        onClick={() => handleToggleUser(user.id, user.isActive)} 
                        className={cn(
                          "rounded-xl p-3 font-bold gap-3 group/item",
                          user.isActive ? "text-destructive focus:text-destructive" : "text-emerald-500 focus:text-emerald-500"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          user.isActive ? "bg-destructive/10" : "bg-emerald-500/10"
                        )}>
                          <Hand className="w-4 h-4" />
                        </div>
                        {user.isActive ? "Sever Local Access" : "Grant Authorization"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Usage Matrix */}
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-[1.8rem] bg-secondary/30 border border-border/50 group-hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Email Quota</span>
                       </div>
                       <span className="text-xs font-black text-foreground">{user.emailUsed} used</span>
                    </div>
                    <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((user.emailUsed / 1000) * 100, 100)}%` }}
                        className="h-full bg-primary"
                       />
                    </div>
                  </div>

                  <div className="p-4 rounded-[1.8rem] bg-secondary/30 border border-border/50 group-hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">SMS Quota</span>
                       </div>
                       <span className="text-xs font-black text-foreground">{user.smsUsed} used</span>
                    </div>
                    <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((user.smsUsed / 100) * 100, 100)}%` }}
                        className="h-full bg-emerald-500"
                       />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border/30">
                   <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground/40" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Real-time Node Status</span>
                   </div>
                   <Badge variant={user.isActive ? "success" : "destructive"} className="h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm ring-1 ring-white/10">
                      {user.isActive ? "Operational" : "Terminated"}
                   </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-30">
             <div className="p-8 rounded-[3rem] bg-secondary border-4 border-dashed border-border">
                <Users className="w-16 h-16 text-muted-foreground" />
             </div>
             <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">No matching nodes located</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
