"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Notification,
  Template,
  AnalyticsData,
  PaginatedResponse,
  ApiKey,
  TeamMember,
  PendingInvite,
} from "@/types/notification";

/* ──────────────────────────────────────────────
   Generic fetcher
   ────────────────────────────────────────────── */
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

/* ──────────────────────────────────────────────
   SSE hook — subscribes to /api/sse and calls
   the provided callback on every event.
   ────────────────────────────────────────────── */
export function useSSE(onEvent: (event: string, data: unknown) => void) {
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    const es = new EventSource("/api/sse");

    es.addEventListener("notification", (e) => {
      try {
        cbRef.current("notification", JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.addEventListener("template", (e) => {
      try {
        cbRef.current("template", JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      // EventSource auto-reconnects; nothing extra needed
    };

    return () => es.close();
  }, []);
}

/* ──────────────────────────────────────────────
   useNotifications — paginated list
   ────────────────────────────────────────────── */
export function useNotifications(filters?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<Notification>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.set("type", filters.type);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);
      params.set("page", String(filters?.page ?? 1));
      params.set("limit", String(filters?.limit ?? 10));

      const result = await apiFetch<PaginatedResponse<Notification>>(
        `/api/notifications?${params.toString()}`
      );
      setData(result);
    } catch (err) {
      console.error("useNotifications error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.status, filters?.search, filters?.page, filters?.limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // SSE live updates
  useSSE((event) => {
    if (event === "notification") {
      refetch();
    }
  });

  return { ...data, loading, refetch };
}

/* ──────────────────────────────────────────────
   useStats — dashboard / analytics stats
   ────────────────────────────────────────────── */
export function useStats() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<AnalyticsData>("/api/notifications/stats");
      setStats(result);
    } catch (err) {
      console.error("useStats error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useSSE((event) => {
    if (event === "notification") refetch();
  });

  return { stats, loading, refetch };
}

/* ──────────────────────────────────────────────
   useTemplates
   ────────────────────────────────────────────── */
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<Template[]>("/api/templates");
      setTemplates(result);
    } catch (err) {
      console.error("useTemplates error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useSSE((event) => {
    if (event === "template") refetch();
  });

  const create = async (body: Partial<Template>) => {
    const created = await apiFetch<Template>("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setTemplates((prev) => [...prev, created]);
    return created;
  };

  const update = async (id: string, body: Partial<Template>) => {
    const updated = await apiFetch<Template>(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return { templates, loading, refetch, create, update, remove };
}

/* ──────────────────────────────────────────────
   useApiKeys
   ────────────────────────────────────────────── */
export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<ApiKey[]>("/api/api-keys");
      setKeys(result);
    } catch (err) {
      console.error("useApiKeys error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = async (name: string) => {
    const created = await apiFetch<ApiKey>("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setKeys((prev) => [...prev, created]);
    return created;
  };

  const revoke = async (id: string) => {
    await apiFetch(`/api/api-keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return { keys, loading, refetch, create, revoke };
}

/* ──────────────────────────────────────────────
   useTeam
   ────────────────────────────────────────────── */
export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<TeamMember[]>("/api/team");
      setMembers(result);
    } catch (err) {
      console.error("useTeam error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const remove = async (id: string) => {
    await apiFetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return { members, loading, refetch, remove };
}

/* ──────────────────────────────────────────────
   useInvites
   ────────────────────────────────────────────── */
export function useInvites() {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<PendingInvite[]>("/api/invites");
      setInvites(result);
    } catch (err) {
      console.error("useInvites error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = async (email: string, role: string) => {
    const created = await apiFetch<PendingInvite>("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setInvites((prev) => [...prev, created]);
    return created;
  };

  const cancel = async (id: string) => {
    await apiFetch(`/api/invites/${id}`, { method: "DELETE" });
    setInvites((prev) => prev.filter((i) => i.id !== id));
  };

  return { invites, loading, refetch, create, cancel };
}

/* ──────────────────────────────────────────────
   useSettings
   ────────────────────────────────────────────── */
export interface SettingsData {
  id: string;
  orgName: string;
  timezone: string;
  retryEnabled: boolean;
  maxRetries: number;
  webhookUrl: string;
  emailProvider: string;
  emailConfig: Record<string, string>;
  smsProvider: string;
  smsConfig: Record<string, string>;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<SettingsData>("/api/settings");
      setSettings(result);
    } catch (err) {
      console.error("useSettings error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const save = async (data: Partial<SettingsData>) => {
    const result = await apiFetch<SettingsData>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSettings(result);
    return result;
  };

  return { settings, loading, refetch, save };
}

/* ──────────────────────────────────────────────
   sendNotification — one-shot send call
   ────────────────────────────────────────────── */
export async function sendNotification(payload: {
  type: "email" | "sms";
  recipient: string;
  subject?: string;
  message?: string;
  templateId?: string;
  variables?: Record<string, string>;
  priority?: string;
  tags?: string[];
}) {
  return apiFetch<Notification>("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
