import { NextRequest } from "next/server";
import { json, error, serialize } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { Notification } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/notifications/[id] */
export async function GET(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const notifications = await getCollection<Notification>("notifications");
  const notification = await notifications.findOne({ id: params.id, userId: session.user.id });

  if (!notification) return error("Not found", 404);
  return json(serialize(notification));
}

/** PATCH /api/notifications/[id] — update status / retry */
export async function PATCH(req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const body = await req.json();

  const notifications = await getCollection<Notification>("notifications");
  const notification = await notifications.findOne({ id: params.id, userId: session.user.id });

  if (!notification) return error("Not found", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: { status?: string; deliveryTimeline?: any; attempts?: number } = {};
  let shouldUnsetError = false;

  if (body.status) {
    updateData.status = body.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (notification.deliveryTimeline as any[]) || [];
    timeline.push({
      status: body.status,
      timestamp: new Date(),
      message: body.message || `Status changed to ${body.status}`,
    });
    updateData.deliveryTimeline = timeline;
  }

  if (body.retry) {
    updateData.status = "queued";
    updateData.attempts = (notification.attempts || 0) + 1;
    shouldUnsetError = true;
  }

  const updateOp: Record<string, unknown> = {
    $set: { ...updateData, updatedAt: new Date() },
  };
  if (shouldUnsetError) {
    updateOp.$unset = { error: "" };
  }
  await notifications.updateOne({ id: params.id, userId: session.user.id }, updateOp);
  const updated = await notifications.findOne({ id: params.id, userId: session.user.id });

  if (!updated) return error("Not found", 404);
  return json(serialize(updated));
}

/** DELETE /api/notifications/[id] */
export async function DELETE(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const notifications = await getCollection<Notification>("notifications");
  const notification = await notifications.findOne({ id: params.id, userId: session.user.id });

  if (!notification) return error("Not found", 404);

  await notifications.deleteOne({ id: params.id, userId: session.user.id });
  return json({ success: true });
}
