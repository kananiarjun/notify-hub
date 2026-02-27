"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Activity,
  Zap,
  TrendingUp,
  Target,
  FileBarChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { useStats } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = ["7D", "30D", "3M"] as const;

const STATUS_COLORS: Record<string, string> = {
  Delivered: "hsl(var(--primary))",
  Failed: "hsl(var(--destructive))",
  Pending: "hsl(var(--warning))",
  Queued: "#6366f1",
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]>("7D");
  const { stats: analytics, loading } = useStats();

  const chartGradients = useMemo(() => ({
    email: {
      id: "gradEmail",
      color: "hsl(var(--primary))",
    },
    sms: {
      id: "gradSms",
      color: "#22c55e",
    },
  }), []);

  if (loading || !analytics) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Aggregating Intelligence...</p>
        </div>
      </PageWrapper>
    );
  }

  const topRecipients = analytics.topRecipients || [];
  const templatePerformance = analytics.templatePerformance || [];
  const failedOverTime = (analytics.failedOverTime || []).map((f) => ({
    date: f.date,
    email: f.count,
    sms: 0,
  }));

  const stats = [
    {
      label: "Dispatch Volume",
      value: analytics.totalSent.toLocaleString(),
      change: "+12.3%",
      up: true,
      icon: Send,
      accent: "text-primary",
      bg: "bg-primary/10",
      description: "Total transmissions initiated across all protocol nodes."
    },
    {
      label: "Success Rate",
      value: `${((analytics.delivered / (analytics.totalSent || 1)) * 100).toFixed(1)}%`,
      change: "+2.1%",
      up: true,
      icon: CheckCircle2,
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Confirmed delivery success ratio for active sequences."
    },
    {
      label: "Terminal Failures",
      value: analytics.failed.toLocaleString(),
      change: "-5.4%",
      up: false,
      icon: XCircle,
      accent: "text-destructive",
      bg: "bg-destructive/10",
      description: "Records of transmissions that reached a terminal error state."
    },
    {
      label: "Active Queue",
      value: analytics.pending.toLocaleString(),
      change: "+0.8%",
      up: true,
      icon: Clock,
      accent: "text-warning",
      bg: "bg-warning/10",
      description: "Transmissions currently residing in the processing buffer."
    },
  ];

  const statusPie = [
    { name: "Delivered", value: analytics.delivered },
    { name: "Failed", value: analytics.failed },
    { name: "Pending", value: analytics.pending },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string; }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 min-w-[160px]">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] font-bold text-foreground/80">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-foreground">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        {/* Advanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="relative group">
               <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-50 transition-transform group-hover:scale-[2]" />
               <div className="relative p-4 rounded-[2rem] bg-card border border-primary/20 text-primary shadow-2xl transition-all group-hover:-translate-y-1">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-foreground tracking-tighter">System Intelligence</h1>
                <Badge variant="outline" className="h-6 px-2 font-black border-primary/20 bg-primary/5 text-primary animate-pulse">LIVE</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg font-medium">Real-time telemetry and deep-learning performance metrics for the notification ecosystem.</p>
            </div>
          </div>
          
          <div className="flex p-1.5 bg-card/50 backdrop-blur-md border border-border rounded-[1.8rem] shadow-sm overflow-hidden ring-1 ring-white/5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setPeriod(opt)}
                className={cn(
                  "px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.4rem] transition-all",
                  period === opt 
                    ? "bg-background text-primary shadow-lg border border-primary/10 scale-[1.05] z-10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Stat Hub */}
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
              className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:bg-card hover:border-primary/20 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <s.icon className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-3 rounded-2xl border border-white/5 shadow-xl transition-transform group-hover:scale-110", s.bg, s.accent)}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <Badge variant={s.up ? "success" : "destructive"} className="gap-1.5 px-3 py-1 font-black shadow-lg">
                    {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {s.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{s.label}</p>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground/40 mt-4 leading-relaxed group-hover:text-muted-foreground/60 transition-colors">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Master Charts Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-2 bg-card/30 backdrop-blur-xl border border-border rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-20">
               <Activity className="w-40 h-40 text-primary blur-3xl" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
              <div className="space-y-1">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Traffic Analytics</h3>
                 <p className="text-[10px] font-bold text-muted-foreground">Historical volume patterns and protocol density.</p>
              </div>
              <div className="flex items-center gap-6 p-2 bg-secondary/30 rounded-[1.5rem] border border-border/50">
                <div className="flex items-center gap-2 px-3 border-r border-border/50">
                   <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Email Node</span>
                </div>
                <div className="flex items-center gap-2 px-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-foreground">SMS Node</span>
                </div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.volumeByDay}>
                  <defs>
                    <linearGradient id="gradEmail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
                    dataKey="email" 
                    name="Email" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#gradEmail)" 
                    strokeWidth={4} 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sms" 
                    name="SMS" 
                    stroke="#22c55e" 
                    fill="url(#gradSms)" 
                    strokeWidth={4} 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-card border border-border rounded-[3.5rem] p-10 shadow-sm flex flex-col items-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
               <Target className="w-40 h-40 text-foreground" />
            </div>
            <div className="w-full space-y-1 mb-12">
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Status Equilibrium</h3>
               <p className="text-[10px] font-bold text-muted-foreground">Distribution of transmission terminal states.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="relative w-full aspect-square max-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={statusPie} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={120} 
                      paddingAngle={10} 
                      dataKey="value" 
                      stroke="none"
                      animationBegin={500}
                      animationDuration={1500}
                    >
                      {statusPie.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} className="outline-none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">Efficiency</p>
                   <p className="text-3xl font-black text-foreground">{((analytics.delivered / (analytics.totalSent || 1)) * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 w-full">
                {statusPie.map((s) => (
                  <div key={s.name} className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/20 border border-border/50 group/item transition-all hover:bg-secondary/40">
                    <div 
                      className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] transition-transform group-hover/item:scale-125" 
                      style={{ backgroundColor: STATUS_COLORS[s.name] }} 
                    />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{s.name}</span>
                      <span className="text-lg font-black text-foreground leading-none mt-1">{s.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Intelligence Deep-Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-10">
               <Zap className="w-5 h-5 text-primary" />
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Blueprint Performance</h3>
            </div>
            <div className="space-y-8">
              {templatePerformance.map((t, idx) => (
                <div key={t.name} className="space-y-3 group/row">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-muted-foreground/40 font-mono tracking-tighter">0{idx + 1}</span>
                       <span className="text-xs font-black text-foreground group-hover/row:text-primary transition-colors">{t.name}</span>
                    </div>
                    <Badge variant="outline" className="font-black text-[9px] border-primary/10 tracking-widest">{t.successRate}% STABILITY</Badge>
                  </div>
                  <div className="relative w-full bg-secondary/50 rounded-full h-3 overflow-hidden border border-border/30 p-0.5 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.successRate}%` }}
                      transition={{ duration: 1.5, delay: idx * 0.1 }}
                      className={cn(
                        "h-full rounded-full transition-all relative",
                        t.successRate > 97 ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : 
                        t.successRate > 94 ? "bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : 
                        "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      )}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-10">
               <TrendingUp className="w-5 h-5 text-destructive" />
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Anomalies & Trends</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failedOverTime}>
                  <CartesianGrid strokeDasharray="6 6" stroke="hsl(var(--border))" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 900 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={15} 
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 900 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-15} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--destructive))', opacity: 0.05 }} />
                  <Bar 
                    dataKey="email" 
                    name="Failure Count" 
                    fill="hsl(var(--destructive))" 
                    radius={[8, 8, 0, 0]} 
                    barSize={32}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-2">Analysis Insight</p>
               <p className="text-xs font-bold text-destructive/80 leading-relaxed">System anomalies are within operational parameters. Peak terminal errors detected in Email node at 04:00 UTC.</p>
            </div>
          </motion.div>
        </div>

        {/* Luxury Data Manifest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[4rem] group-hover:bg-primary/10 transition-colors" />
          <div className="relative bg-card border border-border rounded-[4rem] p-12 shadow-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-4 rounded-[1.8rem] bg-secondary border border-border shadow-inner">
                    <FileBarChart className="w-6 h-6 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground tracking-tight">Transmission Authorities</h3>
                    <p className="text-xs font-bold text-muted-foreground">Top-tier recipients filtered by dispatch density.</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-[1.4rem] bg-secondary/50 border border-border shadow-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Manifest: Last {period}</span>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">Authority Node</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 text-right">Dispatch</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 text-right">Success</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 text-right">Fail</th>
                    <th className="px-6 pb-6 font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 text-right">Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {topRecipients.map((r, i) => (
                    <tr key={r.recipient} className="group/row hover:bg-primary/[0.03] transition-all duration-300">
                      <td className="px-6 py-6">
                         <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-[1.1rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-black text-primary border border-primary/20 shadow-sm group-hover/row:scale-110 transition-transform">
                            {r.recipient.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-foreground group-hover/row:text-primary transition-colors">{r.recipient}</span>
                             <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Verified Node</span>
                          </div>
                         </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-foreground/70 text-right">{r.totalSent.toLocaleString()}</td>
                      <td className="px-6 py-6 text-sm font-black text-emerald-500/80 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            {r.delivered.toLocaleString()}
                         </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-destructive/80 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <div className="w-1 h-1 rounded-full bg-destructive" />
                            {r.failed.toLocaleString()}
                         </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <Badge 
                          variant={r.successRate > 96 ? "success" : "warning"} 
                          className="h-8 px-4 rounded-xl font-black text-[10px] tracking-widest border-border shadow-md ring-1 ring-white/5"
                        >
                          {r.successRate}% STB
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 flex justify-center">
               <button className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-primary transition-colors cursor-pointer flex items-center gap-3 group">
                  Load Extensive Archives
                  <ArrowDownRight className="w-4 h-4 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

