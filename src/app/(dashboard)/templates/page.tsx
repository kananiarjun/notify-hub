"use client";

import React, { useState } from "react";
import { Plus, Pencil, Copy, Trash2, Library, Mail, MessageSquare, Search, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/use-data";
import { Template } from "@/types/notification";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const { toast } = useToast();
  const {
    templates = [],
    loading,
    refetch,
    create,
    update,
    remove,
  } = useTemplates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"email" | "sms">("email");
  const [formSubject, setFormSubject] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formVariables, setFormVariables] = useState<string[]>([]);
  const [varInput, setVarInput] = useState("");

  const filteredTemplates = templates.filter(tpl => 
    tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tpl.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNewDialog = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormType("email");
    setFormSubject("");
    setFormContent("");
    setFormVariables([]);
    setDialogOpen(true);
  };

  const openEditDialog = (tpl: Template) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormType(tpl.type);
    setFormSubject(tpl.subject || "");
    setFormContent(tpl.content);
    setFormVariables(tpl.variables || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    try {
      if (editingTemplate) {
        await update(editingTemplate.id, {
          name: formName,
          type: formType,
          subject: formSubject || undefined,
          content: formContent,
          variables: formVariables,
        });
        toast({ title: "Template updated successfully" });
      } else {
        await create({
          name: formName,
          type: formType,
          subject: formSubject || undefined,
          content: formContent,
          variables: formVariables,
        });
        toast({ title: "Template created successfully" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Failed to save template", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      setDeleteConfirm(null);
      toast({ title: "Template deleted" });
    } catch {
      toast({ title: "Failed to delete template", variant: "destructive" });
    }
  };

  const handleDuplicate = async (tpl: Template) => {
    try {
      await create({
        name: tpl.name + " (Copy)",
        type: tpl.type,
        subject: tpl.subject,
        content: tpl.content,
        variables: tpl.variables,
      });
      toast({ title: "Template duplicated" });
    } catch {
      toast({ title: "Failed to duplicate template", variant: "destructive" });
    }
  };

  const addVariable = () => {
    const v = varInput.trim().replace(/[{}]/g, "");
    if (!v) return;
    if (formVariables.includes(v)) return;

    setFormVariables((prev) => [...prev, v]);
    setFormContent((prev) => prev + ` {{${v}}}`);
    setVarInput("");
  };

  const TemplateCard = ({ tpl }: { tpl: Template }) => (
    <div 
      // variants={staggerItem}
      className="group bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl -mr-8 -mt-8 rounded-full",
        tpl.type === "email" ? "bg-primary" : "bg-emerald-500"
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground leading-none">{tpl.name}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{tpl.type === "email" ? "Email Draft" : "SMS Payload"}</p>
        </div>
        <Badge variant={tpl.type === "email" ? "default" : "success"} className="gap-1 px-2 py-0.5 font-bold">
          {tpl.type === "email" ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
          {tpl.type.toUpperCase()}
        </Badge>
      </div>

      <div className="flex-1 relative z-10">
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed bg-secondary/30 p-3 rounded-xl border border-border/50">
          {tpl.content}
        </p>

        {tpl.variables && tpl.variables.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-4">
            {tpl.variables.map((v) => (
              <span
                key={v}
                className="text-[10px] font-mono font-bold bg-primary/5 text-primary border border-primary/20 px-2 py-1 rounded-md shadow-inner"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-6 mt-auto relative z-10">
        <Button variant="secondary" size="sm" className="flex-1 h-9 font-bold bg-secondary/80 hover:bg-secondary" onClick={() => openEditDialog(tpl)}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleDuplicate(tpl)}>
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setDeleteConfirm(tpl.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Templates</h1>
              <p className="text-sm text-muted-foreground mt-1">Design and manage your reusable communication components</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-5 font-bold border-border bg-card/50" onClick={refetch} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              {loading ? "Syncing..." : "Refresh"}
            </Button>
            <Button className="rounded-2xl h-12 px-6 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={openNewDialog}>
              <Plus className="w-5 h-5 mr-2 stroke-[3]" /> New Template
            </Button>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search templates by name or content..." 
              className="pl-12 h-12 rounded-2xl border-border bg-card/30 focus-visible:ring-primary shadow-inner transition-all hover:bg-card/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Templates Grid */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-pulse h-48"
                >
                  <div className="h-6 bg-muted rounded-xl w-3/4"></div>
                  <div className="h-20 bg-muted rounded-2xl w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-secondary/20 border border-dashed border-border rounded-[3rem] space-y-5"
            >
              <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-border/50">
                <Library className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">No templates discovered</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or create your first masterpiece.</p>
              </div>
              <Button variant="outline" className="rounded-xl px-8 font-black mt-2" onClick={openNewDialog}>
                Start Creating
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filteredTemplates.map((tpl) => (
                <TemplateCard key={tpl.id} tpl={tpl} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] bg-card border-border shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary/10 p-8 border-b border-primary/10 relative">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Library className="w-24 h-24 text-primary" />
             </div>
             <DialogTitle className="text-3xl font-black text-foreground tracking-tight">
               {editingTemplate ? "Refine Template" : "New Blueprint"}
             </DialogTitle>
             <p className="text-sm text-muted-foreground mt-1">Configure the structure and content of your component.</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Blueprint Name</label>
              <Input
                placeholder="Marketing Campaign #1"
                className="h-12 rounded-xl bg-secondary/30 border-border focus-visible:ring-primary font-bold"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Channel Hub</label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={formType === "email" ? "default" : "secondary"}
                  className={cn("flex-1 h-12 rounded-xl font-black gap-2", formType === "email" && "shadow-lg shadow-primary/20")}
                  onClick={() => setFormType("email")}
                >
                  <Mail className="w-4 h-4" /> Email
                </Button>
                <Button
                  type="button"
                  variant={formType === "sms" ? "default" : "secondary"}
                  className={cn("flex-1 h-12 rounded-xl font-black gap-2", formType === "sms" && "shadow-lg shadow-primary/20")}
                  onClick={() => setFormType("sms")}
                >
                  <MessageSquare className="w-4 h-4" /> SMS
                </Button>
              </div>
            </div>

            {formType === "email" && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Subject Line</label>
                <Input
                  placeholder="Welcome to the future of notifications..."
                  className="h-12 rounded-xl bg-secondary/30 border-border font-medium"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Content Architecture</label>
              <Textarea
                placeholder="Hello {{userName}}, your order is on its way!"
                className="rounded-2xl bg-secondary/30 border-border focus-visible:ring-primary font-medium min-h-[140px] resize-none"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Dynamic Variables</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Inject variable (e.g., userName)"
                  className="h-11 rounded-xl bg-secondary/30 border-border font-bold"
                  value={varInput}
                  onChange={(e) => setVarInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVariable();
                    }
                  }}
                />
                <Button type="button" className="h-11 px-6 rounded-xl font-bold" onClick={addVariable}>
                  Add
                </Button>
              </div>
              <AnimatePresence>
                {formVariables.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex gap-2 flex-wrap mt-3"
                  >
                    {formVariables.map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="cursor-pointer font-mono font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 shadow-sm"
                        onClick={() =>
                          setFormVariables((prev) => prev.filter((x) => x !== v))
                        }
                      >
                        {`{{${v}}}`} <span className="text-[8px] opacity-40">×</span>
                      </Badge>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <DialogFooter className="p-8 bg-secondary/20 border-t border-border flex items-center justify-between">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={handleSave} className="px-10 h-12 rounded-xl font-black shadow-lg shadow-primary/10">
              Save Blueprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Destroy Blueprint?"
        description="This action will permanently remove this template from your library. This cannot be undone."
        confirmLabel="Confirm Delete"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />
    </PageWrapper>
  );
}