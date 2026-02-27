"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  History, 
  Search, 
  Download, 
  ExternalLink, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/dashboard/PaymentForm";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  cardLast4: string | null;
  cardBrand: string | null;
  description: string | null;
  processedAt: string | null;
  createdAt: string;
  transactionId: string;
}

interface Stats {
  totalSpent: number;
  completedCount: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</Badge>;
      case "processing":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Processing</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "processing": return <Clock className="w-4 h-4 text-amber-500" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredPayments = payments.filter(p => 
    p.transactionId?.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 lg:px-0">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <History className="w-3 h-3" />
              Transaction Ledger
            </div>
            <h1 className="text-6xl font-black text-foreground tracking-tighter leading-none">Payments & Billing</h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">
              Track your infrastructure investments, manage billing protocols, and review financial history.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-16 px-10 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all font-black uppercase tracking-widest text-xs group">
                <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                Initialize Fund Audit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl p-0 border-none bg-transparent shadow-none overflow-hidden sm:rounded-[3rem]">
              <div className="glass-card p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
                  <CreditCard className="w-48 h-48" />
                </div>
                <PaymentForm 
                  amount={49.00} 
                  onSuccess={() => {
                    setOpen(false);
                    fetchPayments();
                  }}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 lg:px-0"
        >
          <motion.div variants={staggerItem} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
               <TrendingUp className="w-16 h-16" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Total Capital Flow</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">${(stats?.totalSpent ?? 0).toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-500">USD</span>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
               <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Authenticated Transactions</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">{stats?.completedCount || 0}</span>
              <span className="text-xs font-bold text-muted-foreground">EVENTS</span>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
               <CreditCard className="w-16 h-16 text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Primary Node Protocol</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground uppercase tracking-tighter">VISA • 4242</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 lg:px-0">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search via Transaction Hash..."
              className="h-14 pl-12 pr-4 rounded-2xl bg-card/40 backdrop-blur-md border-border/60 focus:border-primary/50 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-14 px-6 rounded-2xl border-border/60 font-bold text-xs uppercase tracking-widest gap-2">
              <Filter className="w-4 h-4" />
              Filtered Display
            </Button>
            <Button variant="outline" className="h-14 px-6 rounded-2xl border-border/60 font-bold text-xs uppercase tracking-widest gap-2">
              <Download className="w-4 h-4" />
              Extract Data
            </Button>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="px-4 lg:px-0">
          <div className="glass-card rounded-[3rem] overflow-hidden border-border/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Transaction Vector</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Metric Capacity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Integrity Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Execution Date</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Clock className="w-12 h-12 text-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Synchronizing Ledger...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-40">
                            <History className="w-12 h-12" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No existing transaction records detected</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <motion.tr 
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-primary/5 transition-colors group/row"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center text-foreground group-hover/row:scale-110 group-hover/row:border-primary/20 transition-all">
                                <DollarSign className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black tracking-tight">{payment.description || "System Resource Sync"}</p>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{payment.transactionId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <p className="text-lg font-black text-foreground tracking-tight">
                                ${payment.amount.toFixed(2)}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                {payment.cardBrand ? `${payment.cardBrand} •••• ${payment.cardLast4}` : "Digital Wallet"}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(payment.status)}
                              {getStatusBadge(payment.status)}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{format(new Date(payment.createdAt), "MMM d, yyyy")}</span>
                              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{format(new Date(payment.createdAt), "HH:mm:ss")}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-card hover:text-primary transition-all">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-card hover:text-primary transition-all">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 glass-card rounded-[3rem] border-primary/10 mx-4 lg:mx-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-black tracking-tight">Financial Shield Enabled</h4>
              <p className="text-sm text-muted-foreground font-medium">Your payment protocols are protected by enterprise-grade encryption and secure handshake layers.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 opacity-40">
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-center">
              PCI DSS<br/>COMPLIANT
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-center">
              SECURE<br/>SSL NODES
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
