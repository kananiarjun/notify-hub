"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  amount: number;
  plan?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ amount, plan, onSuccess, onCancel }: PaymentFormProps) {
  const [step, setStep] = useState<"details" | "processing" | "success" | "error">("details");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "amex" | "discover" | "unknown">("unknown");

  // Format card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    
    // Detect brand
    if (value.startsWith("4")) setCardBrand("visa");
    else if (/^5[1-5]/.test(value)) setCardBrand("mastercard");
    else if (/^3[47]/.test(value)) setCardBrand("amex");
    else if (/^6(?:011|5)/.test(value)) setCardBrand("discover");
    else setCardBrand("unknown");

    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) return;
    setCvc(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("processing");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardExpiry: expiry,
          cardCvc: cvc,
          billingName: name,
          billingEmail: email,
          plan,
          description: plan ? `Subscription to ${plan} Plan` : `One-time payment`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        setTimeout(() => {
          onSuccess();
        }, 2500);
      } else {
        setError(data.message || data.error || "Payment failed");
        setStep("error");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setStep("error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === "details" || step === "error" ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Secure Check-out</h2>
              <p className="text-sm text-muted-foreground">Complete your transaction for <span className="text-foreground font-bold">${amount}</span></p>
            </div>

            {/* Realistic Card Preview */}
            <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-2xl overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <CreditCard className="w-24 h-24" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-8 bg-amber-400/80 rounded-md backdrop-blur-sm" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {cardBrand.toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-black tracking-[0.2em] text-zinc-500">CARD NUMBER</div>
                  <div className="text-xl font-mono tracking-widest">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">CARD HOLDER</div>
                    <div className="text-xs font-bold uppercase truncate max-w-[150px]">
                      {name || "YOUR NAME"}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">EXPIRES</div>
                    <div className="text-xs font-bold">
                      {expiry || "MM/YY"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Billing Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name"
                    placeholder="Arjun Kanani"
                    className="pl-10 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary/50 transition-all font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Card Details</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    className="pl-10 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary/50 transition-all font-mono"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expiry Date</Label>
                  <Input 
                    id="expiry"
                    placeholder="MM/YY"
                    className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary/50 transition-all font-mono"
                    value={expiry}
                    onChange={handleExpiryChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CVC / CVV</Label>
                  <Input 
                    id="cvv"
                    placeholder="•••"
                    type="password"
                    className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary/50 transition-all font-mono"
                    value={cvc}
                    onChange={handleCvcChange}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel}
                  className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 text-xs font-black uppercase tracking-widest group"
                >
                  Confirm Payment
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-4 border-t border-border/50">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              AES-256 Encrypted Infrastructure
            </div>
          </motion.div>
        ) : step === "processing" ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
              <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">Gateway Handshake</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                Authorizing secure transaction...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl relative z-10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Access Granted</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Payment processed successfully. Your account has been upgraded.
              </p>
            </div>
            <Button 
              onClick={onSuccess}
              className="px-8 h-12 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px]"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
