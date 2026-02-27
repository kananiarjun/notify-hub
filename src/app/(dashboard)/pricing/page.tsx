"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2, Zap, Shield, Crown, Sparkles, ArrowRight, ShieldCheck, ZapOff, Layers, Activity, CreditCard } from "lucide-react";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PaymentForm } from "@/components/dashboard/PaymentForm";
import { LucideIcon } from "lucide-react";

interface Plan {
  name: string;
  id: string;
  price: string;
  desc: string;
  features: string[];
  icon: LucideIcon;
  color: string;
  accent: string;
  bg: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "FREE",
    id: "FREE",
    price: "0",
    desc: "Perfect for exploration",
    features: ["1,000 emails per month", "50 SMS messages", "Basic analytics", "Standard support"],
    icon: Zap,
    color: "text-slate-400",
    accent: "slate",
    bg: "bg-slate-500/10",
  },
  {
    name: "BASIC",
    id: "BASIC",
    price: "29",
    desc: "Growing operations",
    features: ["10,000 emails per month", "1,000 SMS messages", "Advanced analytics", "Priority support", "Custom templates"],
    icon: Sparkles,
    color: "text-primary",
    accent: "primary",
    bg: "bg-primary/10",
    popular: true,
  },
  {
    name: "PREMIUM",
    id: "PREMIUM",
    price: "99",
    desc: "Enterprise scale",
    features: ["Unlimited emails", "Unlimited SMS messages", "Real-time analytics", "24/7 dedicated support", "Multiple team seats", "API white-labeling"],
    icon: Crown,
    color: "text-amber-500",
    accent: "amber",
    bg: "bg-amber-500/10",
  },
];

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetch("/api/user/usage")
      .then((res) => res.json())
      .then((data) => {
        setCurrentPlan(data.plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    window.location.reload(); // Refresh to show new plan
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
           <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
              <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Manifest...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-20 pb-32">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
             <Badge variant="outline" className="relative px-6 py-2 border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-xl">
               Resource Scalability
             </Badge>
          </div>
          <h1 className="text-7xl font-black text-foreground tracking-tighter leading-none mt-8">Choose Your Power</h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto px-4">
             Scale your communication infrastructure with precision. Select the node capacity that aligns with your operational requirements.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4 lg:px-0"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;
            
            return (
              <motion.div
                key={plan.name}
                variants={staggerItem}
                className={cn(
                  "relative p-10 bg-card/40 backdrop-blur-xl border-2 rounded-[3.5rem] flex flex-col transition-all duration-700 overflow-hidden group hover:bg-card",
                  plan.popular ? "border-primary/40 shadow-[0_40px_100px_rgba(var(--primary-rgb),0.1)] scale-105 z-10" : "border-border/60 shadow-sm hover:border-primary/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-8">
                     <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl shadow-primary/20 animate-pulse">
                        Most Optimal
                     </div>
                  </div>
                )}

                <div className="absolute -top-10 -right-10 p-20 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none duration-1000 rotate-12 scale-150 group-hover:rotate-0 group-hover:scale-125">
                   <Icon className="w-48 h-48" />
                </div>
                
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-10 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-700", plan.bg, plan.color)}>
                  <Icon className="w-10 h-10" />
                </div>

                <div className="space-y-3 mb-12">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground/60">{plan.name} MANIFEST</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-foreground tracking-tighter">${plan.price}</span>
                    <span className="text-muted-foreground font-black text-xs uppercase tracking-widest opacity-40">/ PER CYCLE</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-bold leading-relaxed pt-4 border-t border-border/50">{plan.desc}</p>
                </div>

                <div className="space-y-6 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-3">
                     <Layers className="w-3 h-3 text-primary" />
                     Capability Deck
                  </p>
                  <ul className="space-y-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4 text-sm font-bold text-foreground/80 group/feat">
                        <div className={cn("mt-0.5 p-1 rounded-full group-hover/feat:scale-125 transition-transform", plan.bg, plan.color)}>
                          <Check className="h-3 w-3" strokeWidth={4} />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(plan)}
                  className={cn(
                    "mt-12 h-16 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all",
                    isCurrent 
                      ? "opacity-50 cursor-default bg-secondary/50" 
                      : plan.popular 
                        ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95" 
                        : "border-2 border-border/50 hover:bg-secondary hover:border-primary/20 hover:-translate-y-1 active:scale-95"
                  )}
                >
                  {isCurrent ? "Active Manifest" : "Initialize Cycle"}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Payment Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-xl p-0 border-none bg-transparent shadow-none overflow-hidden sm:rounded-[3rem]">
            <VisuallyHidden>
              <DialogTitle>Complete Payment</DialogTitle>
            </VisuallyHidden>
            <div className="glass-card p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
                <CreditCard className="w-48 h-48" />
              </div>
              {selectedPlan && (
                <PaymentForm 
                  amount={parseFloat(selectedPlan.price)} 
                  plan={selectedPlan.id}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setSelectedPlan(null)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative group max-w-6xl mx-auto px-4 lg:px-0">
           <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-[4rem] group-hover:bg-primary/10 transition-all pointer-events-none" />
           <div className="relative bg-card/60 backdrop-blur-2xl border border-border rounded-[4rem] p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
                 <Crown className="w-64 h-64 text-primary" />
              </div>
              
              <div className="space-y-4 text-center md:text-left relative z-10 max-w-xl">
                 <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground tracking-tight">Enterprise Infrastructure</h3>
                 </div>
                 <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                    Custom volume requirements, dedicated dispatch nodes, or full white-labeling orchestration. Our enterprise deck offers unparalleled flexibility.
                 </p>
                 <div className="flex items-center gap-6 pt-4">
                    <div className="flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">99.99% Node Uptime</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Shield className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dedicated Support</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                 <Button size="lg" className="rounded-[2rem] px-12 h-16 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                    Consult Expert
                 </Button>
                 <Button variant="outline" size="lg" className="rounded-[2rem] px-12 h-16 text-sm font-black uppercase tracking-[0.2em] border-2 border-border/50 hover:bg-secondary transition-all">
                    Full Spec Sheet
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </PageWrapper>
  );
}
