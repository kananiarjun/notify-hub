"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  RefreshCw,
  MoreHorizontal,
  AlertTriangle,
  Eye,
  RotateCcw,
  Trash2,
  Mail,
  MessageSquare,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, VisuallyHidden } from "@/components/ui/sheet";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PageWrapper, staggerContainer, staggerItem } from "@/components/shared/PageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-data";
import { formatRelativeTime, truncate, copyToClipboard } from "@/lib/utils";
import { Notification, NotificationStatus, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";

const statusFilters = ["all", "queued", "processing", "delivered", "failed"] as const;

const statusBadgeVariant: Record<NotificationStatus, "success" | "destructive" | "warning" | "default"> = {
  delivered: "success",
  failed: "destructive",
  queued: "warning",
  processing: "default",
};

interface NotificationLogsProps {
  type: NotificationType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function NotificationLogs({ type, title, icon: Icon }: NotificationLogsProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sheetNotification, setSheetNotification] = useState<Notification | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const { data: paged, total, totalPages, loading, refetch } = useNotifications({
    type,
    status: statusFilter,
    search,
    page,
    limit: perPage,
  });

  const allSelected = paged.length > 0 && paged.every((n) => selectedRows.has(n.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paged.map((n) => n.id)));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({ title: "System Synced", description: "Log data has been updated from source." });
  };

  const handleCopyId = async (id: string) => {
    await copyToClipboard(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retry: true }),
      });
      toast({ title: "Retry Sequenced", description: `Transmission ${id.slice(0, 8)} re-queued.`, variant: "success" });
      refetch();
    } catch {
      toast({ title: "Retry Failed", description: "Terminal error in retry sequence.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      toast({ title: "Record Deleted", description: `Transmission log ${id.slice(0, 8)} removed.`, variant: "destructive" });
      refetch();
    } catch {
      toast({ title: "Deletion Failed", description: "Internal error during log destruction.", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    const fetchAllNotifications = async () => {
      try {
        const params = new URLSearchParams({
          type,
          status: statusFilter === "all" ? "" : statusFilter,
          search,
          limit: "10000",
          page: "1",
        });
        
        const response = await fetch(`/api/notifications?${params}`);
        const data = await response.json();
        
        if (!data.notifications || data.notifications.length === 0) {
          toast({ title: "Manifest Empty", description: "No notifications found for export manifest.", variant: "destructive" });
          return;
        }

        const headers = ["ID", "Type", "Recipient", type === "email" ? "Subject" : "Message", "Template", "Status", "Attempts", "Priority", "Created At", "Updated At"];
        const csvRows = [
          headers.join(","),
          ...data.notifications.map((n: Notification) => [
            n.id, n.type, `"${n.recipient.replace(/"/g, '""')}"`, `"${(n.subject || n.message || "").replace(/"/g, '""')}"`,
            `"${(n.templateName || "").replace(/"/g, '""')}"`, n.status, n.attempts, n.priority, n.createdAt, n.updatedAt || ""
          ].join(","))
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `${type}-logs-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "Export Complete", description: `Manifest generated with ${data.notifications.length} records.` });
      } catch {
        toast({ title: "Export Failed", description: "Failed to generate CSV manifest.", variant: "destructive" });
      }
    };
    fetchAllNotifications();
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-transform hover:scale-110">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{title}</h1>
                <Badge variant="outline" className="h-6 px-2 font-black border-border bg-card/50">{total}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Audit log and transmission history for all {type.toUpperCase()} channels.</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-11 px-5 font-bold border-border bg-card/50" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              {refreshing ? "Syncing..." : "Sync Logs"}
            </Button>
            <Button className="rounded-2xl h-11 px-6 font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all gap-2" onClick={handleExportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Improved Filter Bar */}
        <div className="bg-card/30 backdrop-blur-md border border-border rounded-[2.5rem] p-6 shadow-sm space-y-6">
           <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Master search: Recipient, Subject, or Record ID..."
                  className="pl-12 h-12 rounded-2xl border-border bg-background/50 focus-visible:ring-primary font-bold shadow-inner"
                />
              </div>
              <div className="flex items-center p-1.5 bg-secondary/50 border border-border/50 rounded-2xl gap-1">
                {statusFilters.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={cn(
                      "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      statusFilter === s
                        ? "bg-background text-primary shadow-sm scale-105"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Advanced Table Container */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden relative min-h-[400px]">
          {loading && (
             <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <div className="p-4 rounded-[2rem] bg-card border border-border shadow-2xl">
                   <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Scanning Archives...</p>
             </div>
          )}

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20 border-b border-border/50">
                  <th className="w-14 px-5 py-5">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="rounded-md" />
                  </th>
                  <th className="px-4 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">ID / Hash</th>
                  <th className="px-4 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Target / Payload</th>
                  <th className="px-4 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Blueprint</th>
                  <th className="px-4 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Status</th>
                  <th className="px-4 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-right pr-10">Timestamp / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <AnimatePresence mode="popLayout">
                  {paged.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={6} className="py-32">
                        <EmptyState
                          icon={History}
                          title="Archive manifest is empty"
                          description="No records matched your current query parameters."
                        />
                      </td>
                    </tr>
                  ) : (
                    paged.map((n) => (
                      <motion.tr
                        key={n.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-secondary/30 transition-all cursor-pointer"
                        onClick={() => setSheetNotification(n)}
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedRows.has(n.id)} onCheckedChange={() => toggleRow(n.id)} className="rounded-md" />
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-8 h-8 rounded-xl flex items-center justify-center",
                               n.status === "delivered" ? "bg-emerald-500/10 text-emerald-500" :
                               n.status === "failed" ? "bg-destructive/10 text-destructive" :
                               "bg-primary/10 text-primary"
                             )}>
                               {n.type === "email" ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                             </div>
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="font-mono text-xs font-bold text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5"
                                  onClick={() => handleCopyId(n.id)}
                                >
                                  {n.id.slice(0, 8)}
                                  {copiedId === n.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-20 group-hover:opacity-100" />}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-xl font-mono text-[10px]">{n.id}</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-4 py-4 min-w-[200px]">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-foreground leading-tight">{truncate(n.recipient, 30)}</p>
                              <p className="text-xs text-muted-foreground/70 leading-tight italic">{truncate(n.subject || n.message || "No content summary available", 45)}</p>
                           </div>
                        </td>
                        <td className="px-4 py-4">
                          {n.templateName ? (
                            <Badge variant="secondary" className="font-bold border border-border/50 bg-secondary/80 lowercase">{n.templateName}</Badge>
                          ) : (
                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Custom Draft</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusBadgeVariant[n.status]} className="gap-2 px-3 py-1 font-black uppercase text-[9px] tracking-wider rounded-lg shadow-sm">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                              n.status === "delivered" ? "bg-emerald-400" : 
                              n.status === "failed" ? "bg-red-400" : 
                              n.status === "queued" ? "bg-amber-400" : "bg-blue-400",
                              (n.status === "processing" || n.status === "queued") && "animate-pulse"
                            )} />
                            {n.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right pr-10" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-6">
                             <Tooltip>
                                <TooltipTrigger className="text-[10px] font-bold text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                   {formatRelativeTime(n.createdAt)}
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl text-[10px] font-bold">{new Date(n.createdAt).toLocaleString()}</TooltipContent>
                             </Tooltip>
                             
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                  <MoreHorizontal className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-border shadow-2xl p-2 min-w-[180px]">
                                <DropdownMenuItem onClick={() => setSheetNotification(n)} className="rounded-xl p-3 font-bold gap-3 group/item">
                                  <div className="p-1.5 rounded-lg bg-secondary group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </div>
                                  View Intelligence
                                </DropdownMenuItem>
                                {n.status === "failed" && (
                                  <DropdownMenuItem onClick={() => handleRetry(n.id)} className="rounded-xl p-3 font-bold gap-3 group/item text-emerald-500 focus:text-emerald-500">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 transition-colors">
                                      <RotateCcw className="w-4 h-4" />
                                    </div>
                                    Retry Sequence
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="my-2" />
                                <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 text-destructive focus:text-destructive group/item" onClick={() => setDeleteConfirm(n.id)}>
                                  <div className="p-1.5 rounded-lg bg-destructive/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </div>
                                  Erase Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Luxury Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-secondary/5 border-t border-border/50 gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Manifest range: {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} of {total}</div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 rounded-xl px-4 border-border font-bold gap-2 hover:bg-card active:scale-95 transition-all" 
                onClick={() => setPage(Math.max(1, page - 1))} 
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1 hidden md:flex">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                   let p = i + 1;
                   if (totalPages > 5 && page > 3) p = page - 3 + i + 1;
                   if (p > totalPages) return null;
                   return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={cn("w-10 h-10 rounded-xl font-black text-xs transition-all", p === page && "shadow-lg shadow-primary/20")}
                    >
                      {p}
                    </Button>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 rounded-xl px-4 border-border font-bold gap-2 hover:bg-card active:scale-95 transition-all" 
                onClick={() => setPage(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Bulk Actions Bar */}
        <AnimatePresence>
          {selectedRows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 lg:left-[calc(50%+140px)] z-50 bg-card/80 backdrop-blur-2xl border border-primary/20 rounded-[2.5rem] px-8 py-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10"
            >
              <div className="flex flex-col">
                <span className="text-xl font-black text-primary leading-none">{selectedRows.size}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground leading-none mt-1">Selected</span>
              </div>
              <Separator orientation="vertical" className="h-10 bg-primary/10" />
              <div className="flex gap-3">
                <Button size="sm" variant="outline" className="h-11 rounded-2xl px-6 font-black text-xs gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all" onClick={() => { selectedRows.forEach((id) => handleRetry(id)); setSelectedRows(new Set()); }}>
                  <RotateCcw className="w-4 h-4" /> Retry Wave
                </Button>
                <Button size="sm" variant="destructive" className="h-11 rounded-2xl px-6 font-black text-xs gap-2 shadow-lg shadow-destructive/20 active:scale-95 transition-all" onClick={() => setSelectedRows(new Set())}>
                  <Trash2 className="w-4 h-4" /> Scrub Archives
                </Button>
              </div>
              <button 
                onClick={() => setSelectedRows(new Set())}
                className="ml-2 p-2 rounded-full hover:bg-secondary/50 transition-colors"
                title="Deselect all"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Luxury Detail Sheet */}
        <Sheet open={!!sheetNotification} onOpenChange={() => setSheetNotification(null)}>
          <SheetContent className="overflow-y-auto sm:max-w-xl rounded-l-[3rem] border-border shadow-2xl p-0">
            <VisuallyHidden>
              <SheetTitle>Notification Details</SheetTitle>
              <SheetDescription>Detailed information about the selected notification.</SheetDescription>
            </VisuallyHidden>
            {sheetNotification && (
              <div className="flex flex-col h-full bg-card">
                <div className="relative h-48 flex items-center justify-center overflow-hidden bg-primary/10 border-b border-primary/5">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                   <div className="absolute top-0 right-0 p-10 opacity-10">
                      <History className="w-40 h-40 text-primary" />
                   </div>
                   <div className="z-10 flex flex-col items-center gap-3">
                      <div className="p-4 rounded-3xl bg-background shadow-xl border border-border/50 scale-110">
                         {sheetNotification.type === "email" ? <Mail className="w-10 h-10 text-primary" /> : <MessageSquare className="w-10 h-10 text-primary" />}
                      </div>
                      <Badge variant={statusBadgeVariant[sheetNotification.status]} className="px-5 py-1.5 font-black uppercase tracking-widest text-[9px] shadow-lg">
                        {sheetNotification.status}
                      </Badge>
                   </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Record Intelligence</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                      <div className="space-y-1">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Target Recipient</Label>
                        <p className="text-sm font-bold text-foreground break-all">{sheetNotification.recipient}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Unique Manifest ID</Label>
                        <p className="text-xs font-mono font-bold text-primary">{sheetNotification.id}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Transmission Node</Label>
                        <p className="text-sm font-bold capitalize">{sheetNotification.type} Protocol</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Priority Matrix</Label>
                        <p className="text-sm font-bold capitalize">{sheetNotification.priority}</p>
                      </div>
                    </div>
                  </div>

                  {sheetNotification.subject && (
                    <div className="space-y-3">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Subject Header</Label>
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border font-bold text-sm leading-relaxed">
                        {sheetNotification.subject}
                      </div>
                    </div>
                  )}

                  {sheetNotification.deliveryTimeline && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-border pb-4">
                        <History className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Sequence Timeline</h3>
                      </div>
                      <div className="space-y-0 ml-4 border-l-2 border-border/50 pl-8">
                        {sheetNotification.deliveryTimeline.map((entry, i) => {
                          const StatusIcon = entry.status === "queued" ? Clock : entry.status === "processing" ? Loader2 : entry.status === "delivered" ? CheckCircle2 : XCircle;
                          return (
                            <div key={i} className="relative pb-10 last:pb-0">
                              <div className={cn(
                                "absolute -left-[45px] top-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 border-card",
                                entry.status === "delivered" ? "bg-emerald-500 text-white" :
                                entry.status === "failed" ? "bg-destructive text-white" :
                                "bg-secondary text-foreground"
                              )}>
                                <StatusIcon className={cn("w-4 h-4", entry.status === "processing" && "animate-spin")} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-wider text-foreground leading-none">{entry.status}</p>
                                <p className="text-[10px] font-bold text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                                {entry.message && <p className="text-xs text-muted-foreground/80 mt-2 bg-secondary/20 p-2 rounded-lg border border-border/30">{entry.message}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {sheetNotification.error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 ring-1 ring-destructive/5 animate-pulse-subtle">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Termination Error Detected</p>
                      </div>
                      <p className="text-xs text-foreground/90 font-mono leading-relaxed break-all bg-black/20 p-3 rounded-lg border border-white/5">{sheetNotification.error}</p>
                    </div>
                  )}

                  {sheetNotification.status === "failed" && (
                    <Button className="w-full h-14 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3" onClick={() => { handleRetry(sheetNotification.id); setSheetNotification(null); }}>
                      <RotateCcw className="w-5 h-5" /> RE-INITIALIZE TRANSMISSION
                    </Button>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
          title="Destructive Action"
          description="Are you sure you want to permanently erase this transmission log from the system archives? This action is irreversible."
          confirmLabel="Execute Deletion"
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        />
      </div>
    </PageWrapper>
  );
}
