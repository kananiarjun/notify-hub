"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  MessageSquare,
  Key,
  Users,
  Shield,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Crown,
  User as UserIcon,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useApiKeys, useTeam, useInvites, useSettings } from "@/hooks/use-data";
import { formatRelativeTime, copyToClipboard, cn } from "@/lib/utils";

type Tab = "general" | "email" | "sms" | "api-keys" | "team";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "email", label: "Email Node", icon: Mail },
  { id: "sms", label: "SMS Gateway", icon: MessageSquare },
  { id: "api-keys", label: "Access Keys", icon: Key },
  { id: "team", label: "Orchestration Team", icon: Users },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="relative group">
               <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-50 group-hover:bg-primary/40 transition-all" />
               <div className="relative p-4 rounded-[2rem] bg-card border border-primary/20 text-primary shadow-2xl transition-transform group-hover:-translate-y-1">
                  <SettingsIcon className="w-8 h-8" />
               </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black text-foreground tracking-tighter">System Configuration</h1>
                 <Badge variant="outline" className="h-6 px-2 font-black border-primary/20 bg-primary/5 text-primary">V2.4.0-STABLE</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm font-medium leading-relaxed">Adjust global orchestration parameters and delivery node protocols.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Tabs */}
          <div className="flex lg:flex-col gap-2 lg:w-64 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group relative whitespace-nowrap lg:whitespace-normal",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-transparent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-transparent"
                )}
              >
                <tab.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-glow"
                    className="absolute inset-0 bg-primary/20 blur-xl -z-10 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {activeTab === "general" && <GeneralTab />}
                {activeTab === "email" && <EmailTab />}
                {activeTab === "sms" && <SMSTab />}
                {activeTab === "api-keys" && <ApiKeysTab />}
                {activeTab === "team" && <TeamTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ==========================
   GENERAL TAB
   ========================== */
function GeneralTab() {
  const { toast } = useToast();
  const { settings, save } = useSettings();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [maxRetries, setMaxRetries] = useState("3");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (settings && !initialized) {
      setOrgName(settings.orgName || "Acme Corp");
      setTimezone(settings.timezone || "UTC");
      setRetryEnabled(settings.retryEnabled ?? true);
      setMaxRetries(String(settings.maxRetries ?? 3));
      setWebhookUrl(settings.webhookUrl || "");
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        orgName,
        timezone,
        retryEnabled,
        maxRetries: parseInt(maxRetries) || 3,
        webhookUrl,
      });
      toast({ title: "Manifest Synchronized", description: "Global orchestration parameters updated successfully.", variant: "success" });
    } catch {
      toast({ title: "Sync Failure", description: "Terminal error during settings commit.", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-10">
      <Card title="Display Architecture" description="Visual mode orchestration">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Theme Protocol</Label>
          {mounted ? (
            <div className="grid grid-cols-3 gap-4 p-1.5 rounded-2xl bg-secondary/50 border border-border/50">
              {["light", "dark", "system"].map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "ghost"}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "rounded-xl h-11 text-[10px] font-black uppercase tracking-widest transition-all",
                    theme === t ? "bg-background text-foreground shadow-lg shadow-black/20 border border-white/5" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {t}
                </Button>
              ))}
            </div>
          ) : (
            <div className="h-14 bg-secondary/50 animate-pulse rounded-2xl border border-border/50" />
          )}
        </div>
      </Card>

      <Card title="Organization Identity" description="Node naming and temporal indexing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Node Descriptor (Name)</Label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-12 rounded-xl bg-secondary/30 font-bold" />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Temporal Bias (Timezone)</Label>
            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="h-12 rounded-xl bg-secondary/30 font-bold" />
          </div>
        </div>
      </Card>

      <Card title="Error Resolution" description="Automatic redelivery sequence parameters">
        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-secondary/20 border border-border/50 group/row">
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground">Protocol Re-execution</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Automatic terminal retry on dispatch failure</p>
          </div>
          <Switch checked={retryEnabled} onCheckedChange={setRetryEnabled} className="data-[state=checked]:bg-primary" />
        </div>
        
        {retryEnabled && (
          <div className="mt-8 pt-8 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-8">
               <div className="space-y-3 flex-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Saturation Limit (Max Retries)</Label>
                  <p className="text-[10px] text-muted-foreground/50">Terminal attempts before sequence termination.</p>
               </div>
               <Input type="number" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} className="w-24 h-14 rounded-2xl bg-secondary/30 font-black text-center text-xl" />
            </div>
          </div>
        )}
      </Card>

      <Card title="Event Propagation" description="External terminal callbacks">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Webhook Endpoint (Callback URL)</Label>
          <div className="relative">
             <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://api.terminal.com/v1/callback" className="h-14 rounded-2xl bg-secondary/30 font-bold pl-12" />
             <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mt-2">Real-time status manifest delivery.</p>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="h-14 rounded-2xl px-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-primary/20">
          {saving ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-3" />}
          Commit Configuration
        </Button>
      </div>
    </div>
  );
}

/* ==========================
   EMAIL TAB
   ========================== */
function EmailTab() {
  const { toast } = useToast();
  const { settings, save } = useSettings();
  const [provider, setProvider] = useState<"sendgrid" | "ses" | "smtp">("smtp");
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (settings && !initialized) {
      setProvider((settings.emailProvider as "sendgrid" | "ses" | "smtp") || "smtp");
      setApiKey(settings.emailConfig?.apiKey || "");
      setFromEmail(settings.emailConfig?.fromEmail || "");
      setFromName(settings.emailConfig?.fromName || "");
      setInitialized(true);
    }
  }, [settings, initialized]);

  const providers = [
    { id: "sendgrid" as const, name: "SendGrid", type: "STP-X", desc: "Global distribution node" },
    { id: "ses" as const, name: "Amazon SES", type: "AWS-D", desc: "Cloud infrastructure priority" },
    { id: "smtp" as const, name: "Custom SMTP", type: "RTL-4", desc: "Isolated mail server protocol" },
  ];

  const testConnection = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTesting(false);
    toast({ title: "Circuit Verified", description: "Email node connection sequence successful.", variant: "success" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        emailProvider: provider,
        emailConfig: { apiKey, fromEmail, fromName },
      });
      toast({ title: "Provider Swapping Completed", description: "Primary email dispatch node synchronized.", variant: "success" });
    } catch {
      toast({ title: "Configuration Failure", description: "Protocol mismatch in email node setup.", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-10">
      <Card title="Dispatch Architecture" description="Global primary email node selection">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={cn(
                "text-left p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden",
                provider === p.id
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                  : "border-border bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40"
              )}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                   <p className={cn("text-xs font-black uppercase tracking-widest", provider === p.id ? "text-primary" : "text-foreground")}>{p.name}</p>
                   <Badge variant="outline" className="h-5 px-1.5 font-black text-[8px] border-white/10 bg-white/5 opacity-40">{p.type}</Badge>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground/70 transition-colors leading-relaxed">{p.desc}</p>
              </div>
              {provider === p.id && (
                <div className="absolute top-0 right-0 p-4">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Terminal Authentication" description="Secure gateway credentials">
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Node API Access Secret</Label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="h-12 rounded-xl bg-secondary/30 font-mono tracking-widest" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dispatcher Terminal (From Email)</Label>
              <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="h-12 rounded-xl bg-secondary/30 font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Alias Descriptor (From Name)</Label>
              <Input value={fromName} onChange={(e) => setFromName(e.target.value)} className="h-12 rounded-xl bg-secondary/30 font-bold" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={testConnection} disabled={testing} className="h-14 rounded-2xl px-8 font-black text-xs uppercase tracking-widest border-2 border-border/50 hover:bg-secondary transition-all">
          {testing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-3" />}
          Initialize Handshake
        </Button>
        <Button onClick={handleSave} disabled={saving} className="h-14 rounded-2xl px-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-primary/20">
          {saving ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-3" />}
          Verify and Commit
        </Button>
      </div>
    </div>
  );
}

/* ==========================
   SMS TAB
   ========================== */
function SMSTab() {
  const { toast } = useToast();
  const { settings, save } = useSettings();
  const [provider, setProvider] = useState<"twilio" | "vonage" | "custom">("twilio");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (settings && !initialized) {
      setProvider((settings.smsProvider as "twilio" | "vonage" | "custom") || "twilio");
      setAccountSid(settings.smsConfig?.accountSid || "");
      setAuthToken(settings.smsConfig?.authToken || "");
      setFromNumber(settings.smsConfig?.fromNumber || "");
      setInitialized(true);
    }
  }, [settings, initialized]);

  const providers = [
    { id: "twilio" as const, name: "Twilio", type: "GSM-1", desc: "Unified cellular relay network" },
    { id: "vonage" as const, name: "Vonage", type: "NET-X", desc: "Integrated protocol priority" },
    { id: "custom" as const, name: "Custom API", type: "PTH-0", desc: "Proprietary gateway initialization" },
  ];

  const testConnection = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTesting(false);
    toast({ title: "Gateway Stream Active", description: "SMS terminal handshake verified.", variant: "success" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        smsProvider: provider,
        smsConfig: { accountSid, authToken, fromNumber },
      });
      toast({ title: "Gateway Sequence Committed", description: "SMS transmission node operational.", variant: "success" });
    } catch {
      toast({ title: "Circuit Failure", description: "Unable to reconcile SMS provider credentials.", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-10">
      <Card title="Cellular Architecture" description="Primary SMS gateway node selection">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={cn(
                "text-left p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden",
                provider === p.id
                  ? "border-emerald-500 bg-emerald-500/5 shadow-xl shadow-emerald-500/5"
                  : "border-border bg-secondary/20 hover:border-emerald-500/30 hover:bg-secondary/40"
              )}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                   <p className={cn("text-xs font-black uppercase tracking-widest", provider === p.id ? "text-emerald-500" : "text-foreground")}>{p.name}</p>
                   <Badge variant="outline" className="h-5 px-1.5 font-black text-[8px] border-white/10 bg-white/5 opacity-40">{p.type}</Badge>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground/70 transition-colors leading-relaxed">{p.desc}</p>
              </div>
              {provider === p.id && (
                <div className="absolute top-0 right-0 p-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Gateway Credentials" description="Network authentication parameters">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Account Identifier (SID)</Label>
              <Input value={accountSid} onChange={(e) => setAccountSid(e.target.value)} placeholder="AC..." className="h-12 rounded-xl bg-secondary/30 font-mono tracking-tighter" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Security Token</Label>
              <Input type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl bg-secondary/30 font-mono tracking-widest" />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Originating Network ID (From Number)</Label>
            <div className="relative w-max">
              <Input value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} className="w-64 h-14 rounded-2xl bg-secondary/30 pl-12 font-mono text-lg font-black" placeholder="+1234567890" />
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button variant="outline" onClick={testConnection} disabled={testing} className="h-14 rounded-2xl px-8 font-black text-xs uppercase tracking-widest border-2 border-border/50 hover:bg-secondary transition-all">
          {testing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-3" />}
          Ping Gateway
        </Button>
        <Button onClick={handleSave} disabled={saving} className="h-14 rounded-2xl px-12 bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-emerald-500/20">
          {saving ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Zap className="w-4 h-4 mr-3" />}
          Operationalize Node
        </Button>
      </div>
    </div>
  );
}

/* ==========================
   API KEYS TAB
   ========================== */
function ApiKeysTab() {
  const { toast } = useToast();
  const { keys, create, revoke } = useApiKeys();
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleShow = (id: string) => setShowKey((p) => ({ ...p, [id]: !p[id] }));

  const maskKey = (key: string) => key.substring(0, 8) + "•".repeat(24);

  const handleCreate = async () => {
    try {
      const key = await create(newKeyName);
      setNewKeyDialog(false);
      setNewKeyName("");
      toast({ title: "Access Node Initialized", description: "API key generated. Ensure secure storage." });
      setShowKey((p) => ({ ...p, [key.id]: true }));
    } catch {
      toast({ title: "Authorization Failure", description: "Failed to generate access node.", variant: "destructive" });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revoke(id);
      setDeleteId(null);
      toast({ title: "Node Decommissioned", description: "Access key immediately invalidated.", variant: "destructive" });
    } catch {
      toast({ title: "Decommission Failure", description: "Unable to revoke access node.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-10">
      <Card
        title="Access Nodes"
        description="High-security terminal authentication keys"
        action={
          <Button size="sm" onClick={() => setNewKeyDialog(true)} className="h-11 px-6 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="w-3.5 h-3.5" /> Initialize Node
          </Button>
        }
      >
        <div className="space-y-4">
          {keys.map((k) => (
            <div
              key={k.id}
              className="group/key relative p-6 rounded-3xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/20 transition-all duration-500 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                     <p className="text-sm font-black text-foreground uppercase tracking-tight">{k.name}</p>
                     <Badge variant="outline" className="h-5 px-1.5 font-black text-[8px] bg-primary/5 text-primary border-primary/20 uppercase tracking-widest">Active</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md relative group/code">
                       <code className="block w-full text-[11px] text-muted-foreground/80 font-mono bg-black/20 border border-white/5 px-4 py-2.5 rounded-xl shadow-inner overflow-hidden text-ellipsis whitespace-nowrap">
                         {showKey[k.id] ? k.key : maskKey(k.key)}
                       </code>
                       <div className="absolute inset-y-0 right-2 flex items-center gap-1 opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <button onClick={() => toggleShow(k.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all">
                            {showKey[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => { copyToClipboard(k.key); toast({ title: "Manifest Copied" }); }}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      Protocol Init: {formatRelativeTime(k.createdAt)}
                    </p>
                    {k.lastUsedAt && (
                      <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                        Last Pulse: {formatRelativeTime(k.lastUsedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="h-12 px-6 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                  onClick={() => setDeleteId(k.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Decommission
                </Button>
              </div>
              
              <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover/key:opacity-10 transition-opacity rotate-12 group-hover/key:rotate-0 duration-1000">
                 <Key className="w-24 h-24" />
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/30">
               <Key className="w-12 h-12 text-muted-foreground/20 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">No access nodes initialized</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={newKeyDialog} onOpenChange={setNewKeyDialog}>
        <DialogContent className="rounded-[2.5rem] border-border/50 bg-card/95 backdrop-blur-2xl p-10 max-w-lg">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black tracking-tighter">Initialize Access Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Node Descriptor (Key Name)</Label>
              <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Production Relay v2" className="h-14 rounded-2xl bg-secondary/30 font-bold border-border/50" />
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
                  Warning: The generated manifest secret will only be visible once. Immediate secure record retention is mandatory.
               </p>
            </div>
          </div>
          <DialogFooter className="mt-10 gap-3">
            <Button variant="ghost" onClick={() => setNewKeyDialog(false)} className="rounded-xl font-black text-[10px] uppercase tracking-widest">Abort</Button>
            <Button onClick={handleCreate} disabled={!newKeyName.trim()} className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">Authorize and Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Confirm Decommission"
        description="This action will immediately terminate the authentication handshake for this node. All dependent terminal services will experience authentication failure."
        confirmLabel="Decommission Node"
        onConfirm={() => deleteId && handleRevoke(deleteId)}
      />
    </div>
  );
}

/* ==========================
   TEAM TAB
   ========================== */
function TeamTab() {
  const { toast } = useToast();
  const { members, remove: removeMember } = useTeam();
  const { invites, create: createInvite, cancel: cancelInvite } = useInvites();
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "developer" | "viewer">("developer");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const roleColors: Record<string, string> = {
    owner: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    admin: "text-primary bg-primary/10 border-primary/20",
    member: "text-muted-foreground bg-secondary/50",
    developer: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    viewer: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  const roleIcons: Record<string, React.ElementType> = {
    owner: Crown,
    admin: Shield,
    member: UserIcon,
    developer: Zap,
    viewer: Eye,
  };

  const handleInvite = async () => {
    try {
      await createInvite(inviteEmail, inviteRole);
      setInviteDialog(false);
      setInviteEmail("");
      toast({ title: "Invitation Dispatched", variant: "success" });
    } catch {
      toast({ title: "Dispatch Failure", description: "Failed to send orchestration invite.", variant: "destructive" });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMember(id);
      setRemoveId(null);
      toast({ title: "Entity Removed", description: "Team member access revoked.", variant: "destructive" });
    } catch {
      toast({ title: "Removal Error", description: "Unable to decommission team member.", variant: "destructive" });
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      await cancelInvite(id);
      toast({ title: "Invitation Terminated" });
    } catch {
      toast({ title: "Termination Failure", description: "Unable to cancel pending invite.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-10">
      <Card
        title="Orchestration Team"
        description="Active entities with system access"
        action={
          <Button size="sm" onClick={() => setInviteDialog(true)} className="h-11 px-6 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="w-3.5 h-3.5" /> Invite Entity
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((m) => {
            const RoleIcon = roleIcons[m.role] || UserIcon;
            return (
              <div
                key={m.id}
                className="flex items-center gap-5 p-5 rounded-3xl bg-secondary/20 border border-border/50 group hover:bg-secondary/40 hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-lg font-black shadow-xl">
                     {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-background border-2 border-secondary flex items-center justify-center text-primary">
                      <RoleIcon className="w-3 h-3" />
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground tracking-tight">{m.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed mt-0.5">{m.email}</p>
                  <div className="mt-3">
                     <Badge variant="outline" className={cn("gap-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-transparent", roleColors[m.role])}>
                       {m.role}
                     </Badge>
                  </div>
                </div>
                {m.role !== "admin" && m.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                    onClick={() => setRemoveId(m.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {invites.length > 0 && (
        <Card title="Pending Manifests" description="Awaiting entity initialization">
          <div className="space-y-4">
            {invites.map((inv) => (
              <div
                key={inv.email}
                className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl bg-secondary/10 border border-dashed border-border/60"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground">{inv.email}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Dispatched {formatRelativeTime(inv.sentAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                   <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-orange-500/5 text-orange-500 border-orange-500/20">Pending {inv.role}</Badge>
                   <Button
                     variant="ghost"
                     size="sm"
                     className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:bg-red-500/5"
                     onClick={() => handleCancelInvite(inv.id)}
                   >
                     Terminate
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent className="rounded-[2.5rem] border-border/50 bg-card/95 backdrop-blur-2xl p-10 max-w-lg">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black tracking-tighter">Invite Team Entity</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Entity Email Terminal</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="entity@organization.com"
                className="h-14 rounded-2xl bg-secondary/30 font-bold border-border/50"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Access Protocol (Role)</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["admin", "developer", "viewer"] as const).map((r) => (
                  <Button
                    key={r}
                    variant={inviteRole === r ? "default" : "outline"}
                    onClick={() => setInviteRole(r)}
                    className={cn(
                       "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                       inviteRole === r ? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/10" : "border-border/50 hover:bg-secondary"
                    )}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-12 gap-3">
            <Button variant="ghost" onClick={() => setInviteDialog(false)} className="rounded-xl font-black text-[10px] uppercase tracking-widest">Abort</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()} className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20">Dispatch Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={() => setRemoveId(null)}
        title="Revoke Entity Access"
        description="This will immediately terminate the entity's access to the orchestration dashboard. Manifest associations will be archived."
        confirmLabel="Revoke Access"
        onConfirm={() => removeId && handleRemove(removeId)}
      />
    </div>
  );
}

/* ==========================
   SHARED CARD WRAPPER
   ========================== */
function Card({ title, children, action, description }: { title: string; children: React.ReactNode; action?: React.ReactNode; description?: string }) {
  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-[3rem] p-10 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none -translate-y-4 translate-x-4">
         <SettingsIcon className="w-48 h-48" />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 relative z-10">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">{title}</h3>
          {description && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{description}</p>}
        </div>
        {action && <div className="animate-in fade-in slide-in-from-right-4 duration-700">{action}</div>}
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
