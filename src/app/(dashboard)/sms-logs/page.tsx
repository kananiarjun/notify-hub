"use client";

import { MessageSquare } from "lucide-react";
import { NotificationLogs } from "@/components/shared/notification-logs";

export default function SmsLogsPage() {
  return <NotificationLogs type="sms" title="SMS Logs" icon={MessageSquare} />;
}
