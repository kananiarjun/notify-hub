import { NextRequest } from "next/server";
import { json, error, parsePagination, serialize, serializeMany } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { Notification } from "@/lib/schema";
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

  const notificationsCollection = await getCollection<Notification>("notifications");

  const [notifications, total] = await Promise.all([
    notificationsCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    notificationsCollection.countDocuments({ userId: session.user.id }),
  ]);

  return json({
    data: serializeMany(notifications),
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

    const notificationsCollection = await getCollection<Notification>("notifications");
    const now = new Date();
    const notification: Notification = {
      id: randomUUID(),
      type,
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
          details: "Notification queued for delivery",
        },
      ],
      createdAt: now,
      updatedAt: now,
      userId: session.user.id,
    };

    await notificationsCollection.insertOne(notification);

    return json(serialize(notification), 201);
  } catch (e) {
    console.error("POST /api/notifications error:", e);
    return error("Failed to create notification", 500);
  }
}
