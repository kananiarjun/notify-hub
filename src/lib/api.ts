import {
  Notification,
  NotificationFilters,
  PaginatedResponse,
  SendNotificationPayload,
  Template,
  AnalyticsData,
  ApiKey,
  TeamMember,
  PendingInvite,
} from "@/types/notification";

const BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "/api";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Notifications
export async function sendNotification(
  payload: SendNotificationPayload
): Promise<Notification> {
  return apiFetch<Notification>("/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getNotifications(
  filters?: NotificationFilters
): Promise<PaginatedResponse<Notification>> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "all") {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString();
  return apiFetch<PaginatedResponse<Notification>>(
    `/notifications${query ? `?${query}` : ""}`
  );
}

export async function getNotificationById(
  id: string
): Promise<Notification> {
  return apiFetch<Notification>(`/notifications/${id}`);
}

export async function retryNotification(
  id: string
): Promise<Notification> {
  return apiFetch<Notification>(`/notifications/${id}/retry`, {
    method: "POST",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}`, { method: "DELETE" });
}

export async function bulkRetryNotifications(ids: string[]): Promise<void> {
  return apiFetch<void>("/notifications/bulk-retry", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function bulkDeleteNotifications(ids: string[]): Promise<void> {
  return apiFetch<void>("/notifications/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// Analytics
export async function getAnalytics(
  period: string = "7d"
): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>(`/analytics?period=${period}`);
}

// Templates
export async function getTemplates(): Promise<Template[]> {
  return apiFetch<Template[]>("/templates");
}

export async function createTemplate(
  data: Omit<Template, "id" | "isDefault" | "usageCount" | "createdAt" | "updatedAt">
): Promise<Template> {
  return apiFetch<Template>("/templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTemplate(
  id: string,
  data: Partial<Template>
): Promise<Template> {
  return apiFetch<Template>(`/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  return apiFetch<void>(`/templates/${id}`, { method: "DELETE" });
}

// API Keys
export async function getApiKeys(): Promise<ApiKey[]> {
  return apiFetch<ApiKey[]>("/api-keys");
}

export async function generateApiKey(data: {
  name: string;
  permissions: string[];
}): Promise<ApiKey & { fullKey: string }> {
  return apiFetch("/api-keys", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function revokeApiKey(id: string): Promise<void> {
  return apiFetch<void>(`/api-keys/${id}`, { method: "DELETE" });
}

// Team
export async function getTeamMembers(): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>("/team");
}

export async function inviteTeamMember(data: {
  email: string;
  role: string;
}): Promise<PendingInvite> {
  return apiFetch<PendingInvite>("/team/invite", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeTeamMember(id: string): Promise<void> {
  return apiFetch<void>(`/team/${id}`, { method: "DELETE" });
}

export async function getPendingInvites(): Promise<PendingInvite[]> {
  return apiFetch<PendingInvite[]>("/team/invites");
}

export async function cancelInvite(id: string): Promise<void> {
  return apiFetch<void>(`/team/invites/${id}`, { method: "DELETE" });
}

// Settings
export async function testEmailConnection(config: Record<string, string>): Promise<{ success: boolean; message: string }> {
  return apiFetch("/settings/email/test", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export async function testSmsConnection(phone: string): Promise<{ success: boolean; message: string }> {
  return apiFetch("/settings/sms/test", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}
