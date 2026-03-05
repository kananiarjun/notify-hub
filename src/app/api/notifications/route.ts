import { NextRequest } from "next/server";
import { json, error, parsePagination, serialize, serializeMany } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { SmsLog, EmailLog } from "@/lib/schema";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/notifications — list with filters & pagination */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const { page, limit, skip } = parsePagination(req);
  const type = req.nextUrl.searchParams.get("type") as "email" | "sms" | null;
  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search");

  const smsLogsCollection = await getCollection<SmsLog>("sms_logs");
  const emailLogsCollection = await getCollection<EmailLog>("email_logs");

  // Build query filter
  const buildFilter = () => {
    const filter: Record<string, unknown> = { userId: session.user.id };
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { recipient: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }
    return filter;
  };

  let allNotifications: Array<SmsLog | EmailLog> = [];
  let total = 0;

  if (type === "email") {
    // Only email logs
    [allNotifications, total] = await Promise.all([
      emailLogsCollection
        .find(buildFilter())
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      emailLogsCollection.countDocuments(buildFilter()),
    ]);
  } else if (type === "sms") {
    // Only SMS logs
    [allNotifications, total] = await Promise.all([
      smsLogsCollection
        .find(buildFilter())
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      smsLogsCollection.countDocuments(buildFilter()),
    ]);
  } else {
    // Both - combine from both collections
    const [smsLogs, emailLogs, smsCount, emailCount] = await Promise.all([
      smsLogsCollection.find(buildFilter()).sort({ createdAt: -1 }).toArray(),
      emailLogsCollection.find(buildFilter()).sort({ createdAt: -1 }).toArray(),
      smsLogsCollection.countDocuments(buildFilter()),
      emailLogsCollection.countDocuments(buildFilter()),
    ]);
    total = smsCount + emailCount;
    // Merge and sort by createdAt
    allNotifications = [...smsLogs, ...emailLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    // Apply pagination manually
    allNotifications = allNotifications.slice(skip, skip + limit);
  }

  return json({
    data: serializeMany(allNotifications),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

/** POST /api/notifications — create (queue) a new notification */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await req.json();
    const { type, recipient, subject, message, templateId, priority, tags } = body;

    if (!type || !recipient) {
      return error("type and recipient are required");
    }

    const now = new Date();

    if (type === "email") {
      const emailLogsCollection = await getCollection<EmailLog>("email_logs");
      const emailLog: EmailLog = {
        id: randomUUID(),
        recipient,
        subject,
        message,
        templateId,
        status: "queued",
        priority: priority || "normal",
        attempts: 0,
        tags: tags || [],
        deliveryTimeline: [
          {
            status: "queued",
            timestamp: now,
            details: "Email queued for delivery",
          },
        ],
        createdAt: now,
        updatedAt: now,
        userId: session.user.id,
      };
      await emailLogsCollection.insertOne(emailLog);
      return json(serialize(emailLog), 201);
    } else {
      const smsLogsCollection = await getCollection<SmsLog>("sms_logs");
      const smsLog: SmsLog = {
        id: randomUUID(),
        recipient,
        message,
        templateId,
        status: "queued",
        priority: priority || "normal",
        attempts: 0,
        tags: tags || [],
        deliveryTimeline: [
          {
            status: "queued",
            timestamp: now,
            details: "SMS queued for delivery",
          },
        ],
        createdAt: now,
        updatedAt: now,
        userId: session.user.id,
      };
      await smsLogsCollection.insertOne(smsLog);
      return json(serialize(smsLog), 201);
    }
  } catch (e) {
    console.error("POST /api/notifications error:", e);
    return error("Failed to create notification", 500);
  }
}
