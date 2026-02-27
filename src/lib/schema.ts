// MongoDB Schema Models for NotifyHub

export interface User {
  _id?: string;
  id: string; // Custom ID for compatibility
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  plan: 'FREE' | 'BASIC' | 'PREMIUM';
  emailUsed: number;
  smsUsed: number;
  planStartDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string;
  id: string; // Custom ID for compatibility
  type: string;
  recipient: string;
  subject?: string;
  message?: string;
  templateId?: string;
  templateName?: string;
  variables?: Record<string, any>;
  status: string;
  priority: string;
  attempts: number;
  error?: string;
  tags: string[];
  sentAt?: Date;
  deliveredAt?: Date;
  deliveryTimeline?: Array<{
    timestamp: Date;
    status: string;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Template {
  _id?: string;
  id: string; // Custom ID for compatibility
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ApiKey {
  _id?: string;
  id: string; // Custom ID for compatibility
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  usageCount: number;
  createdAt: Date;
  userId: string;
}

export interface TeamMember {
  _id?: string;
  id: string; // Custom ID for compatibility
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Invite {
  _id?: string;
  id: string; // Custom ID for compatibility
  email: string;
  role: string;
  sentAt: Date;
  userId: string;
}

export interface Settings {
  _id?: string;
  id: string; // Custom ID for compatibility
  orgName: string;
  timezone: string;
  retryEnabled: boolean;
  maxRetries: number;
  webhookUrl: string;
  emailProvider: string;
  emailConfig?: Record<string, any>;
  smsProvider: string;
  smsConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Payment {
  _id?: string;
  id: string; // Custom ID for compatibility
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  cardLast4?: string;
  cardBrand?: string;
  description?: string;
  plan?: string;
  billingName?: string;
  billingEmail?: string;
  transactionId?: string;
  receiptUrl?: string;
  failureReason?: string;
  refundedAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
