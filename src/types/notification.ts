export type NotificationType = "email" | "sms";
export type NotificationStatus = "queued" | "processing" | "delivered" | "failed";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  message?: string;
  templateId?: string;
  templateName?: string;
  variables: Record<string, string>;
  status: NotificationStatus;
  priority: Priority;
  attempts: number;
  error?: string;
  tags: string[];
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  deliveryTimeline?: DeliveryTimelineEntry[];
}

export interface DeliveryTimelineEntry {
  status: NotificationStatus;
  timestamp: string;
  message?: string;
}

export interface Template {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  variables: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  avgEmailDeliveryTime: number;
  avgSmsDeliveryTime: number;
  bounceRate: number;
  peakHour: string;
  volumeByDay: VolumeByDay[];
  statusBreakdown: StatusBreakdown[];
  templatePerformance: TemplatePerformance[];
  topRecipients: TopRecipient[];
  failedOverTime: { date: string; count: number }[];
}

export interface VolumeByDay {
  date: string;
  total: number;
  email: number;
  sms: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  color: string;
}

export interface TemplatePerformance {
  name: string;
  successRate: number;
  totalSent: number;
}

export interface TopRecipient {
  recipient: string;
  totalSent: number;
  delivered: number;
  failed: number;
  successRate: number;
}

export interface NotificationFilters {
  type?: NotificationType;
  status?: NotificationStatus | "all";
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendNotificationPayload {
  type: NotificationType;
  recipient: string;
  subject?: string;
  message?: string;
  templateId?: string;
  variables?: Record<string, string>;
  priority: Priority;
  scheduledAt?: string;
  tags?: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "developer" | "viewer";
  avatarColor: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: "admin" | "member" | "developer" | "viewer";
  sentAt: string;
}
