"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mail,
  Type,
  Eye,
  X,
  Plus,
  Loader2,
  Smartphone,
  Globe,
  Tag,
  Clock,
  MessageCircle,
  Hash,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Activity,
  Calendar,
  ChevronRight,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { useToast } from "@/hooks/use-toast";
import { useTemplates, sendNotification } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

const priorityOptions = [
  { value: "low", label: "Protocol Low", color: "text-zinc-500", bg: "bg-zinc-500/10", icon: Zap },
  { value: "normal", label: "Standard Relay", color: "text-primary", bg: "bg-primary/10", icon: Zap },
  { value: "high", label: "High Priority", color: "text-amber-500", bg: "bg-amber-500/10", icon: ShieldCheck },
  { value: "urgent", label: "CRITICAL ALPHA", color: "text-red-500", bg: "bg-red-500/10", icon: Activity },
];

const countryCodes = [
  { code: "+1", flag: "🇺🇸", name: "US", network: "NANP" },
  { code: "+44", flag: "🇬🇧", name: "UK", network: "BT-G" },
  { code: "+91", flag: "🇮🇳", name: "IN", network: "TRAI" },
  { code: "+61", flag: "🇦🇺", name: "AU", network: "Telstra" },
];

export default function SendNotificationPage() {
  const { toast } = useToast();
  const { templates: allTemplates } = useTemplates();
  const emailTemplates = allTemplates.filter((t) => t.type === "email");
  const smsTemplates = allTemplates.filter((t) => t.type === "sms");

  const [mode, setMode] = useState<"email" | "sms">("email");
  const [sending, setSending] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  // Email fields
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // SMS fields
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [smsMessage, setSmsMessage] = useState("");

  // Common
  const [priority, setPriority] = useState("normal");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const templates = mode === "email" ? emailTemplates : smsTemplates;
  const currentTemplate = templates.find((t) => t.id === selectedTemplate);
  const templateVariables = currentTemplate?.variables || [];

  const charCount = smsMessage.length;
  const smsSegments = Math.max(1, Math.ceil(charCount / 160));
  const charProgress = (charCount % 160) / 1.6;

  const previewContent = useMemo(() => {
    let content = mode === "email" ? emailBody : smsMessage;
    if (!content) return "";
    Object.entries(variableValues).forEach(([key, val]) => {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || `<span class='text-primary opacity-50 underline'>{{${key}}}</span>`);
    });
    return content;
  }, [mode, emailBody, smsMessage, variableValues]);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    setVariableValues({});
    const tpl = templates.find((t) => t.id === id);
    if (tpl?.type === "sms") setSmsMessage(tpl.content);
    if (tpl?.type === "email") {
      if (tpl.subject) setSubject(tpl.subject);
      setEmailBody(tpl.content || "");
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSend = async () => {
    if (!email && mode === "email") return toast({ title: "Email required", variant: "destructive" });
    if (!phone && mode === "sms") return toast({ title: "Phone required", variant: "destructive" });

    setSending(true);
    try {
      await sendNotification({
        type: mode,
        recipient: mode === "email" ? email : countryCode + phone,
        subject: mode === "email" ? subject : undefined,
        message: mode === "sms" ? smsMessage : emailBody,
        templateId: selectedTemplate !== "custom" ? selectedTemplate : undefined,
        variables: variableValues,
        priority,
        tags,
      });
      
      toast({
        title: "Mission Accomplished",
        description: `Your ${mode.toUpperCase()} has been dispatched.`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Dispatch Failure",
        description: err.message || "Something went wrong in the matrix.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-12 pb-32">
        {/* Header Console */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20 group hover:scale-105 transition-transform">
               <Send className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Dispatch Center</h1>
                 <Badge variant="outline" className="font-black text-[10px] bg-primary/5 text-primary border-primary/20">v2.0 Beta</Badge>
               </div>
               <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">Global Communications Orchestration Unit</p>
            </div>
          </div>

          <div className="flex p-2 bg-secondary/30 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-inner">
            <button
              onClick={() => { setMode("email"); setSelectedTemplate(""); }}
              className={cn(
                "px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center gap-3",
                mode === "email" ? "bg-background text-foreground shadow-2xl border border-border/50 scale-[1.05]" : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
              )}
            >
              <Mail className="w-4 h-4" /> Email Protocol
            </button>
            <button
              onClick={() => { setMode("sms"); setSelectedTemplate(""); }}
              className={cn(
                "px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center gap-3",
                mode === "sms" ? "bg-background text-foreground shadow-2xl border border-border/50 scale-[1.05]" : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
              )}
            >
              <MessageCircle className="w-4 h-4" /> SMS Protocol
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Orchestration Form */}
          <motion.div 
            className="lg:col-span-12 xl:col-span-8 space-y-10"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={staggerItem} className="bg-card/40 backdrop-blur-2xl border border-border rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
                 <Layers className="w-64 h-64" />
              </div>

              <div className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <AnimatePresence mode="wait">
                    {mode === "email" ? (
                      <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 md:col-span-2">
                         <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Recipient Destination</Label>
                          <div className="relative group/input">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="recipient@terminal.com" className="h-16 pl-14 rounded-2xl bg-secondary/20 border-border/50 focus-visible:ring-primary font-black shadow-inner" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Payload Title (Subject)</Label>
                          <div className="relative group/input">
                            <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Transmission Header Identification..." className="h-16 pl-14 rounded-2xl bg-secondary/20 border-border/50 font-bold shadow-inner" />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="sms" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 md:col-span-2">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Global Connection Node (Phone)</Label>
                          <div className="flex gap-4">
                            <Select value={countryCode} onValueChange={setCountryCode}>
                              <SelectTrigger className="w-64 h-16 rounded-2xl bg-secondary/20 border-border/50 font-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-2xl">
                                {countryCodes.map((c) => (
                                  <SelectItem key={c.code} value={c.code} className="rounded-xl p-3">
                                     <div className="flex items-center gap-3">
                                       <span className="text-lg">{c.flag}</span>
                                       <div className="flex flex-col">
                                          <span className="font-black text-xs leading-none">{c.code}</span>
                                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{c.name} • {c.network}</span>
                                       </div>
                                     </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="relative flex-1 group/input">
                              <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="000 000 0000" className="h-16 pl-14 rounded-2xl bg-secondary/20 border-border/50 font-black tracking-widest shadow-inner" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Template Manifest (Blueprint)</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="h-16 rounded-2xl bg-secondary/20 border-border/50 font-black">
                        <div className="flex items-center gap-4">
                           <div className="p-2 bg-primary/10 rounded-lg">
                              <Sparkles className="w-4 h-4 text-primary" />
                           </div>
                           <SelectValue placeholder="Initialize from communication blueprint..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-[2.5rem] border-border/50 bg-card/95 backdrop-blur-2xl p-4">
                        <SelectItem value="custom" className="rounded-2xl p-4 mb-2 hover:bg-primary/5">
                           <div className="flex flex-col">
                             <span className="font-black text-xs uppercase">Discrete Original</span>
                             <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Manual transmission construction</span>
                           </div>
                        </SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="rounded-2xl p-4 hover:bg-primary/5">
                             <div className="flex flex-col">
                               <span className="font-black text-xs uppercase">{t.name}</span>
                               <span className="text-[9px] font-medium text-primary uppercase tracking-widest">Active Template • {t.variables.length} Params</span>
                             </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Transmission Payload</Label>
                      {mode === "sms" && (
                        <div className="flex items-center gap-4">
                          <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className={cn("h-full transition-all", charCount > 160 ? "bg-red-500" : "bg-primary")}
                              animate={{ width: `${Math.min(100, charProgress)}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{charCount} / 160 • {smsSegments} SEGS</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Textarea
                        value={mode === "email" ? emailBody : smsMessage}
                        onChange={(e) => mode === "email" ? setEmailBody(e.target.value) : setSmsMessage(e.target.value)}
                        placeholder={mode === "email" ? "Enter HTML/Text dispatch sequence..." : "Enter alphanumeric mission parameters..."}
                        rows={10}
                        className="rounded-3xl bg-secondary/20 border-border/50 font-mono text-sm shadow-inner p-8 resize-none focus-visible:ring-primary leading-relaxed"
                      />
                      <div className="absolute bottom-6 right-6 p-2 bg-background/50 rounded-xl border border-border/50 backdrop-blur-sm">
                         <Activity className="w-4 h-4 text-primary/30" />
                      </div>
                    </div>
                  </div>
                </div>

                {templateVariables.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 border-t border-border/30">
                    <div className="flex items-center gap-3 ml-1">
                       <Layers className="w-4 h-4 text-primary" />
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Injection Matrix (Variables)</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {templateVariables.map((v) => (
                        <div key={v} className="space-y-3 group/var">
                          <div className="flex items-center gap-2 ml-1">
                            <Hash className="w-3 h-3 text-primary/40 group-focus-within/var:text-primary transition-colors" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{v}</span>
                          </div>
                          <Input
                            value={variableValues[v] || ""}
                            onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                            placeholder={`Define parameter ${v}...`}
                            className="h-12 rounded-xl bg-secondary/20 border-border/50 text-xs font-bold focus:bg-background transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div variants={staggerItem} className="bg-card/40 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 space-y-10 group">
                 <div className="space-y-6">
                  <div className="flex items-center gap-3 ml-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Relay Priority</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {priorityOptions.map((p) => {
                       const Icon = p.icon;
                       return (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          className={cn(
                            "flex flex-col items-center justify-center py-4 rounded-[1.5rem] transition-all gap-2 border border-border/50",
                            priority === p.value ? `${p.bg} ${p.color} border-primary/40 shadow-xl scale-[1.02]` : "text-muted-foreground/40 hover:bg-secondary/50"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Temporal Relay (Scheduling)</Label>
                    </div>
                    <Switch checked={scheduled} onCheckedChange={setScheduled} className="data-[state=checked]:bg-primary" />
                  </div>
                  <AnimatePresence>
                    {scheduled && (
                      <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 8 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="grid grid-cols-2 gap-4">
                        <div className="relative group/time">
                          <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="h-14 rounded-xl bg-secondary/30 border-border/50 text-[11px] font-black uppercase tracking-widest pl-12" />
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within/time:text-primary" />
                        </div>
                        <div className="relative group/time">
                          <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="h-14 rounded-xl bg-secondary/30 border-border/50 text-[11px] font-black uppercase tracking-widest pl-12" />
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within/time:text-primary" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="bg-card/40 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 ml-1">
                    <Tag className="w-4 h-4 text-primary" />
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mission Classification (Tags)</Label>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[44px]">
                    {tags.map((tag) => (
                      <Badge key={tag} className="gap-2 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all cursor-default">
                        {tag}
                        <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-primary hover:scale-125 transition-transform">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {tags.length === 0 && <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.3em] ml-1 pt-2">No active tags...</span>}
                  </div>
                  <div className="flex gap-3 relative">
                    <div className="relative flex-1 group/tag">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within/tag:text-primary" />
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="Define mission tag..."
                        className="h-14 pl-12 rounded-2xl bg-secondary/30 border-border/50 text-xs font-black uppercase tracking-widest"
                      />
                    </div>
                    <Button variant="outline" className="h-14 w-14 p-0 rounded-2xl border-border/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95" onClick={addTag}>
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                   <Button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-4 bg-primary text-primary-foreground"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    {sending ? "TRANSMITTING DATA..." : "AUTHORIZE DISPATCH"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Real-time Visualization */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Real-time Preview</h3>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0 border-border">Live Stream</Badge>
                </div>

                <div className="bg-secondary/20 p-6 min-h-[500px] flex flex-col items-center justify-center relative">
                  <AnimatePresence mode="wait">
                    {mode === "email" ? (
                      <motion.div key="email-preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
                        <div className="w-full bg-background rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
                          <div className="bg-muted px-4 py-3 border-b border-border flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-destructive/30" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                            </div>
                            <div className="flex-1 max-w-[150px] mx-auto h-4 bg-background rounded-full flex items-center px-3">
                               <Globe className="w-2 h-2 text-muted-foreground/30 mr-1" />
                               <div className="h-1.5 w-full bg-secondary rounded-full" />
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="space-y-2 border-b border-border/50 pb-4 text-[10px]">
                              <p className="flex justify-between items-center"><span className="text-muted-foreground font-black uppercase">Sender:</span> <span className="font-bold">NotifyHub Cloud</span></p>
                              <p className="flex justify-between items-center"><span className="text-muted-foreground font-black uppercase">Target:</span> <span className="font-bold text-primary">{email || "[Recipient]"}</span></p>
                              <p className="flex justify-between items-center"><span className="text-muted-foreground font-black uppercase">Subject:</span> <span className="font-bold italic">{subject || "[No Subject Defined]"}</span></p>
                            </div>
                            <div 
                              className="text-xs text-foreground leading-relaxed prose prose-sm prose-invert max-w-none line-clamp-[12]"
                              dangerouslySetInnerHTML={{ __html: previewContent || "<p class='text-muted-foreground italic opacity-50 text-center py-20 uppercase tracking-widest font-black'>Awaiting transmission payload...</p>" }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="sms-preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-[240px]">
                        <div className="relative aspect-[9/18.5] bg-zinc-950 rounded-[3rem] border-[6px] border-zinc-800 shadow-2xl overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-6 bg-transparent flex items-center justify-between px-8 z-10">
                             <div className="text-[10px] text-white font-black">9:41</div>
                             <div className="w-16 h-4 bg-zinc-800 rounded-full" />
                             <div className="flex gap-1">
                                <div className="w-2 h-2 bg-white/20 rounded-full" />
                                <div className="w-2 h-2 bg-white/20 rounded-full" />
                             </div>
                          </div>
                          <div className="mt-8 flex flex-col items-center gap-1 opacity-40">
                             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-[10px] font-black">{phone ? phone.slice(-2) : "CF"}</div>
                             <div className="text-[8px] text-white font-bold">{phone || "Unknown Connection"}</div>
                          </div>
                          <div className="mt-6 px-4 flex flex-col gap-4 overflow-y-auto max-h-[300px] scrollbar-none">
                             {previewContent ? (
                               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="self-end max-w-[90%] bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-none text-[10px] font-medium leading-relaxed shadow-lg">
                                 <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                                 <div className="text-[8px] text-primary-foreground/50 mt-1 text-right font-black uppercase">Delivered • Now</div>
                               </motion.div>
                             ) : (
                               <div className="text-center py-20">
                                  <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest leading-relaxed">System ready.<br/>Enter payload to<br/>simulate link.</p>
                               </div>
                             )}
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 h-8 bg-zinc-900 rounded-full flex items-center px-4 gap-2">
                             <div className="w-4 h-4 bg-zinc-800 rounded-full" />
                             <div className="flex-1 h-3 bg-zinc-800 rounded-full" />
                             <div className="w-3 h-3 bg-primary rounded-full" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
                 <div className="p-2 bg-primary/10 rounded-xl">
                   <Shield className="w-5 h-5 text-primary" />
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-xs font-black uppercase tracking-widest text-primary">Transmission Security</h4>
                   <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-semibold">Your payload is encrypted using protocol 256-Bit TLS before being routed through our secure dispatch relays.</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
