"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Mail,
  MessageSquare,
  ArrowRight,
  Loader2,
  LayoutDashboard,
  Activity,
  Zap,
  Globe,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { useNotifications, useStats } from "@/hooks/use-data";
import { formatRelativeTime, truncate, cn } from "@/lib/utils";
import { NotificationStatus } from "@/types/notification";
import { UsageCard } from "@/components/dashboard/UsageCard";

const statusBadgeVariant: Record<NotificationStatus, "success" | "destructive" | "warning" | "default"> = {
  delivered: "success",
  failed: "destructive",
  queued: "warning",
  processing: "default",
};

const DONUT_COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))"];

export default function DashboardPage() {
  const { stats: analyticsData, loading: statsLoading } = useStats();
  const { data: notifications, loading: notifsLoading } = useNotifications({ page: 1, limit: 10 });

  const CustomTooltip = useMemo(() => ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl ring-1 ring-white/10">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] font-bold text-foreground/80">{entry.name}</span>
                 </div>
                 <span className="text-xs font-black text-foreground">{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }, []);

  if (statsLoading || notifsLoading || !analyticsData) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse rounded-full" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse tracking-[0.3em]">Booting Intelligence...</p>
        </div>
      </PageWrapper>
    );
  }

  const { totalSent, delivered, failed, pending, volumeByDay, statusBreakdown } = analyticsData;
  const totalDonut = delivered + failed + pending;

  const stats = [
    {
      label: "Node Dispatch",
      value: totalSent.toLocaleString(),
      change: "+12.4%",
      up: true,
      icon: Send,
      accent: "text-primary",
      bg: "bg-primary/10",
      description: "Aggregated sequence initiations."
    },
    {
      label: "Success Rate",
      value: `${((delivered / (totalSent || 1)) * 100).toFixed(1)}%`,
      change: "+2.1%",
      up: true,
      icon: CheckCircle2,
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Validated terminal successes."
    },
    {
      label: "Anomalies",
      value: failed.toLocaleString(),
      change: "+3.2%",
      up: false,
      icon: XCircle,
      accent: "text-destructive",
      bg: "bg-destructive/10",
      description: "Terminal protocol violations."
    },
    {
      label: "Active Queue",
      value: pending.toLocaleString(),
      change: "STABLE",
      up: true,
      icon: Clock,
      accent: "text-warning",
      bg: "bg-warning/10",
      description: "Processing buffer occupancy."
    },
  ];

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        {/* Master Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div className="flex items-center gap-5">
              <div className="relative group">
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-50 group-hover:bg-primary/40 transition-all" />
                 <div className="relative p-4 rounded-[2rem] bg-card border border-primary/20 text-primary shadow-2xl transition-transform group-hover:-translate-y-1">
                    <LayoutDashboard className="w-8 h-8" />
                 </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl font-black text-foreground tracking-tighter">Command Dashboard</h1>
                   <Badge variant="outline" className="h-6 px-2 font-black border-primary/20 bg-primary/5 text-primary animate-pulse">SYSTEM SYNCED</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm font-medium leading-relaxed">Global orchestration node for multi-channel communication telemetry.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1.5 rounded-[1.2rem] bg-card/50 border border-border">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-[0.9rem] bg-background border border-border/50 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active</span>
                 </div>
                 <Badge variant="outline" className="h-9 px-4 rounded-[0.9rem] font-bold border-border/50 bg-secondary/30">
                    LATENCY: 14MS
                 </Badge>
              </div>
           </div>
        </div>

        <UsageCard />

        {/* Dynamic Telemetry Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className="group bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:bg-card hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none">
                 <s.icon className="w-32 h-32" />
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={cn("p-3 rounded-2xl border border-white/5 shadow-xl transition-all group-hover:scale-110", s.bg, s.accent)}>
                  <s.icon className="w-6 h-6" />
                </div>
                <Badge variant={s.up && s.label !== "Anomalies" ? "success" : "destructive"} className="gap-1.5 px-3 py-1 font-black shadow-lg">
                  {s.label === "Active Queue" ? <Activity className="w-3.5 h-3.5" /> : (s.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />)}
                  {s.change}
                </Badge>
              </div>
              
              <div className="relative z-10 space-y-1">
                <p className="text-4xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{s.label}</p>
              </div>

              <p className="text-[10px] font-bold text-muted-foreground/30 mt-4 leading-relaxed group-hover:text-muted-foreground/50 transition-colors">{s.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Intelligence Visualization Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-3 bg-card/30 backdrop-blur-xl border border-border rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.02] group-hover:opacity-10 transition-opacity duration-700">
               <Globe className="w-48 h-48 text-primary blur-2xl" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6 relative z-10">
              <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Protocol Density</h3>
                 <p className="text-[10px] font-bold text-muted-foreground">Historical volume patterns across active dispatch nodes.</p>
              </div>
              <div className="flex items-center gap-6 p-2 bg-secondary/30 rounded-[1.5rem] border border-border/50">
                <div className="flex items-center gap-2 px-3 border-r border-border/50">
                   <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Total Load</span>
                </div>
                <div className="flex items-center gap-2 px-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Stream Node</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeByDay}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 900 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={20}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 900 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-20} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Aggregate" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#gradTotal)" 
                    strokeWidth={4} 
                    animationDuration={2500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sms" 
                    name="Gateway" 
                    stroke="#10b981" 
                    fill="transparent" 
                    strokeWidth={2} 
                    strokeDasharray="8 8"
                    animationDuration={3000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-2 bg-card border border-border rounded-[3.5rem] p-10 shadow-sm flex flex-col items-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
               <Zap className="w-48 h-48 text-foreground" />
            </div>
            
            <div className="w-full space-y-1 mb-12">
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Status Equilibrium</h3>
               <p className="text-[10px] font-bold text-muted-foreground">Real-time terminal state reconciliation.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
              <div className="relative w-full aspect-square max-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={statusBreakdown} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={110} 
                      paddingAngle={10} 
                      dataKey="count" 
                      nameKey="status" 
                      stroke="none"
                      animationBegin={400}
                      animationDuration={1800}
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={entry.status} fill={DONUT_COLORS[index % DONUT_COLORS.length]} className="outline-none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">AGGREGATE</p>
                   <p className="text-4xl font-black text-foreground">{totalDonut.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 w-full px-4">
                {statusBreakdown.map((s, i) => (
                  <div key={s.status} className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all group/status">
                    <div 
                      className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] group-hover/status:scale-125 transition-transform" 
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} 
                    />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{s.status}</span>
                      <span className="text-lg font-black text-foreground leading-none mt-1">{s.count.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transmission Manifest Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-[4rem] group-hover:bg-primary/10 transition-colors pointer-events-none" />
          <div className="relative bg-card border border-border rounded-[4rem] p-12 shadow-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-8">
              <div className="flex items-center gap-5">
                 <div className="p-4 rounded-[1.8rem] bg-secondary border border-border shadow-inner">
                    <Activity className="w-6 h-6 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground tracking-tight">System Manifest</h3>
                    <p className="text-xs font-bold text-muted-foreground">The 10 most recent transmission sequences initialized by this node.</p>
                 </div>
              </div>
              <Link href="/email-logs" className="group/link flex items-center gap-4 px-8 py-4 rounded-[1.8rem] bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                Extensive Logs
                <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Protocol</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Terminal</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Sequence Header</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Status Index</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 text-right">Synchronization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {notifications.slice(0, 10).map((n) => (
                    <tr key={n.id} className="group/row hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer">
                      <td className="px-6 py-6 border-transparent group-hover/row:border-primary/20">
                        <Badge variant={n.type === "email" ? "default" : "success"} className="h-8 gap-2.5 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-border shadow-md">
                          {n.type === "email" ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                          {n.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-[1rem] bg-secondary/50 flex items-center justify-center text-[10px] font-black group-hover/row:bg-primary/[0.05] group-hover/row:text-primary transition-colors border border-transparent group-hover/row:border-primary/20">
                              {n.recipient.slice(0, 2).toUpperCase()}
                           </div>
                           <span className="text-sm font-black text-foreground group-hover/row:text-primary transition-colors font-mono">{n.recipient}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-muted-foreground/70">{truncate(n.subject || n.message || "UNTITLED SEQUENCE", 35)}</td>
                      <td className="px-6 py-6">
                        <Badge variant={statusBadgeVariant[n.status]} className="h-8 gap-2 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm ring-1 ring-white/10">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            n.status === "delivered" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                            n.status === "failed" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                            n.status === "queued" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
                            "bg-blue-500 animate-pulse"
                          )} />
                          {n.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-muted-foreground/30 text-right uppercase tracking-tighter">
                         {formatRelativeTime(n.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 flex justify-center">
               <button className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 hover:text-primary transition-colors cursor-pointer flex items-center gap-3 group/btn">
                  Syncing Terminal Data
                  <Activity className="w-4 h-4 animate-pulse group-hover/btn:scale-125 transition-transform" />
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}