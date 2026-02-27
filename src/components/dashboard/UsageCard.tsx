"use client";

import React, { useEffect, useState } from "react";
import { 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  Loader2, 
  Send, 
  MessageCircle,
  Zap,
  Activity,
  ShieldCheck,
  Crown,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function UsageCard() {
  const { toast } = useToast();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/user/usage");
      if (!res.ok) throw new Error("Synchronization failure: Unable to retrieve resource metrics.");
      const data = await res.json();
      setUsage(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleSendEmail = async () => {
    const to = window.prompt("Recipient Terminal Address (Email)?");
    const subject = window.prompt("Transmission Header (Subject)?");
    const text = window.prompt("Sequence Payload (Body)?");
    if (!to || !subject || !text) return;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text })
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: "Transmission Success", description: "Email protocol executed successfully." });
        fetchUsage();
      } else {
        toast({ title: "Transmission Failed", description: result.error || "Terminal error in email dispatcher.", variant: "destructive" });
      }
    } catch {
      toast({ title: "System Error", description: "Internal circuit failure during dispatch.", variant: "destructive" });
    }
  };

  const handleSendSMS = async () => {
    const to = window.prompt("Recipient Network ID (Phone)?");
    const message = window.prompt("Message String?");
    if (!to || !message) return;

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message })
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: "Transmission Success", description: "SMS gateway sequence completed." });
        fetchUsage();
      } else {
        toast({ title: "Transmission Failed", description: result.error || "SMS protocol violation.", variant: "destructive" });
      }
    } catch {
      toast({ title: "System Error", description: "Cellular stack initialization failed.", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
        <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing Resource Graph...</p>
    </div>
  );
  
  if (error) return (
    <div className="bg-destructive/5 border border-destructive/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-6">
      <div className="p-4 rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black text-foreground">Metrics Synchronization Failed</h3>
        <p className="text-xs font-medium text-muted-foreground max-w-xs">{error}</p>
      </div>
      <Button variant="outline" className="rounded-xl px-8 font-black border-destructive/20 hover:bg-destructive/5" onClick={fetchUsage}>
        Initialize Re-Sync
      </Button>
    </div>
  );
  
  if (!usage) return null;

  const emailLimit = usage.limitEmail || 1000;
  const smsLimit = usage.limitSms || 100;
  const emailProgress = Math.min((usage.emailUsed / emailLimit) * 100, 100);
  const smsProgress = Math.min((usage.smsUsed / smsLimit) * 100, 100);

  return (
    <div className="group relative">
      <div className="absolute inset-x-10 -bottom-5 h-20 bg-primary/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="relative overflow-hidden bg-card/40 backdrop-blur-xl border border-border rounded-[3rem] p-8 shadow-2xl transition-all duration-500 hover:border-primary/20">
        <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700">
          <Layers className="w-64 h-64 text-primary rotate-12 scale-110" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                 <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <Crown className="w-7 h-7" />
                 </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black text-foreground tracking-tight capitalize">{usage.plan} Manifest</h3>
                   <Badge variant={usage.isActive ? "success" : "destructive"} className="h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm ring-1 ring-white/10">
                    {usage.isActive ? "FULLY OPERATIONAL" : "RESTRICTED ACCESS"}
                  </Badge>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-1 flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Real-time Node Saturation Metrics
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-secondary/50 border border-border/50 shadow-inner">
               <ShieldCheck className="w-4 h-4 text-primary" />
               <span className="text-xs font-black text-foreground uppercase tracking-widest">Protocol Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Usage Node */}
            <div className="relative rounded-[2.2rem] bg-secondary/20 border border-border/50 p-8 group/card hover:bg-secondary/40 transition-all duration-500 overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover/card:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                  <Mail className="w-32 h-32" />
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-transform group-hover/card:scale-110">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-foreground">Email Deliveries</span>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">STP-4 DISPATCH NODE</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-foreground leading-none">{usage.emailUsed.toLocaleString()}</p>
                       <p className="text-[9px] font-black text-muted-foreground/40 mt-1 uppercase tracking-tighter">
                          OF {usage.limitEmail === null ? "MAX CAPACITY" : usage.limitEmail.toLocaleString()}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative w-full h-3 bg-background/50 rounded-full border border-border/50 p-0.5 shadow-inner overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${emailProgress}%` }}
                        className={cn(
                          "h-full rounded-full transition-all relative overflow-hidden",
                          emailProgress > 90 ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]'
                        )} 
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Latency: 12ms</span>
                       <span className="text-[9px] font-black text-primary uppercase tracking-widest">{emailProgress.toFixed(1)}% Load</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendEmail}
                    disabled={Number(usage.emailUsed) >= (usage.limitEmail || Infinity) || !usage.isActive}
                    className="w-full mt-10 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-30 disabled:grayscale"
                  >
                    <Send className="w-4 h-4 mr-3" /> Initiate Protocol Test
                  </Button>
               </div>
            </div>

            {/* SMS Usage Node */}
            <div className="relative rounded-[2.2rem] bg-secondary/20 border border-border/50 p-8 group/card hover:bg-secondary/40 transition-all duration-500 overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover/card:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                  <MessageCircle className="w-32 h-32 text-emerald-500" />
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm transition-transform group-hover/card:scale-110">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-foreground">SMS Transmissions</span>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">GSM-X GATEWAY</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-foreground leading-none">{usage.smsUsed.toLocaleString()}</p>
                       <p className="text-[9px] font-black text-muted-foreground/40 mt-1 uppercase tracking-tighter">
                          OF {usage.limitSms === null ? "MAX CAPACITY" : usage.limitSms.toLocaleString()}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative w-full h-3 bg-background/50 rounded-full border border-border/50 p-0.5 shadow-inner overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${smsProgress}%` }}
                        className={cn(
                          "h-full rounded-full transition-all relative overflow-hidden",
                          smsProgress > 90 ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        )} 
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Jitter: 4ms</span>
                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{smsProgress.toFixed(1)}% Load</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendSMS}
                    disabled={Number(usage.smsUsed) >= (usage.limitSms || Infinity) || !usage.isActive}
                    className="w-full mt-10 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow-emerald-500/10 disabled:opacity-30 disabled:grayscale"
                  >
                    <Zap className="w-4 h-4 mr-3" /> Test Gateway Stream
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
