import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { json, error, serialize } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { Notification, Template } from "@/lib/schema";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/* ──────────────────────────────────────────────
   Nodemailer transporter (lazy-init)
   ────────────────────────────────────────────── */
function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/* ──────────────────────────────────────────────
   Twilio client (lazy-init)
   ────────────────────────────────────────────── */
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

/* ──────────────────────────────────────────────
   Replace {{variable}} placeholders
   ────────────────────────────────────────────── */
function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

/* ──────────────────────────────────────────────
   POST /api/send
   ────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await req.json();
    const {
      type,
      recipient,
      subject,
      message,
      templateId,
      variables = {},
      priority = "normal",
      tags = [],
    } = body;

    if (!type || !recipient) {
      return error("type and recipient are required");
    }
    if (type !== "email" && type !== "sms") {
      return error("type must be email or sms");
    }

    /* ── resolve template if provided ── */
    let finalSubject = subject || "";
    let finalMessage = message || "";
    let templateName: string | undefined;

    if (templateId) {
      const templates = await getCollection<Template>("templates");
      const template = await templates.findOne({ id: templateId, userId: session.user.id });

      if (template) {
        templateName = template.name;
        finalSubject = subject ?? template.subject ?? "";
        finalMessage = message ?? template.content;
      }

      finalSubject = interpolate(finalSubject, variables);
      finalMessage = interpolate(finalMessage, variables);
    } else {
      // If custom message, interpolate with variables
      finalSubject = interpolate(finalSubject, variables);
      finalMessage = interpolate(finalMessage, variables);
    }

    /* ── create notification record (db) ── */
    const notifications = await getCollection<Notification>("notifications");
    const now = new Date();
    const notification: Notification = {
      id: randomUUID(),
      type,
      recipient,
      subject: finalSubject,
      message: finalMessage,
      templateId,
      templateName,
      variables,
      status: "processing",
      priority,
      attempts: 1,
      tags,
      deliveryTimeline: [
        { status: "queued", timestamp: now, details: "Notification queued" },
        { status: "processing", timestamp: now, details: "Sending…" },
      ],
      createdAt: now,
      updatedAt: now,
      userId: session.user.id,
    };
    await notifications.insertOne(notification);

    /* ── actually send ── */
    try {
      if (type === "email") {
        const transporter = getMailTransporter();
        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || "NotifyHub"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
          to: recipient,
          subject: finalSubject,
          html: finalMessage,
        });
      } else {
        const client = getTwilioClient();
        await client.messages.create({
          body: finalMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const timeline = (notification.deliveryTimeline as unknown as any[]) || [];
      timeline.push({
        status: "delivered",
        timestamp: new Date(),
        message: `${type === "email" ? "Email" : "SMS"} delivered successfully`,
      });

      await notifications.updateOne(
        { id: notification.id, userId: session.user.id },
        {
          $set: {
            status: "delivered",
            sentAt: new Date(),
            deliveredAt: new Date(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            deliveryTimeline: timeline as any,
            updatedAt: new Date(),
          },
        }
      );
      const updated = await notifications.findOne({ id: notification.id, userId: session.user.id });

      if (!updated) {
        return error("Failed to update notification", 500);
      }

      return json(serialize(updated), 200);
    } catch (sendErr: unknown) {
      /* mark failed */
      const errMsg = sendErr instanceof Error ? sendErr.message : String(sendErr);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const timeline = (notification.deliveryTimeline as unknown as any[]) || [];
      timeline.push({
        status: "failed",
        timestamp: new Date(),
        message: errMsg,
      });

      await notifications.updateOne(
        { id: notification.id, userId: session.user.id },
        {
          $set: {
            status: "failed",
            error: errMsg,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            deliveryTimeline: timeline as any,
            updatedAt: new Date(),
          },
        }
      );
      const updated = await notifications.findOne({ id: notification.id, userId: session.user.id });

      if (!updated) {
        return error("Failed to update notification", 500);
      }

      return json(serialize(updated), 207);
    }
  } catch (e) {
    console.error("POST /api/send error:", e);
    return error("Failed to send notification", 500);
  }
}
