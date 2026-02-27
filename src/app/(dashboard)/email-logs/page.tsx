"use client";

import { Mail } from "lucide-react";
import { NotificationLogs } from "@/components/shared/notification-logs";

export default function EmailLogsPage() {
  return <NotificationLogs type="email" title="Email Logs" icon={Mail} />;
}
