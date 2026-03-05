import { NextRequest } from "next/server";
import { json, error, serialize } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { SmsLog, EmailLog } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

// Helper to find log in either collection
async function findLog(userId: string, id: string): Promise<{ log: SmsLog | EmailLog | null; collectionName: string }> {
  const smsLogs = await getCollection<SmsLog>("sms_logs");
  const emailLogs = await getCollection<EmailLog>("email_logs");
  
  const [smsLog, emailLog] = await Promise.all([
    smsLogs.findOne({ id, userId }),
    emailLogs.findOne({ id, userId }),
  ]);
  
  if (smsLog) return { log: smsLog, collectionName: "sms_logs" };
  if (emailLog) return { log: emailLog, collectionName: "email_logs" };
  return { log: null, collectionName: "" };
}

/** GET /api/notifications/[id] */
export async function GET(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const { log } = await findLog(session.user.id, params.id);
  if (!log) return error("Not found", 404);
  return json(serialize(log));
}

/** PATCH /api/notifications/[id] — update status / retry */
export async function PATCH(req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const body = await req.json();

  const { log, collectionName } = await findLog(session.user.id, params.id);
  if (!log) return error("Not found", 404);

  const collection = collectionName === "email_logs" 
    ? await getCollection<EmailLog>("email_logs")
    : await getCollection<SmsLog>("sms_logs");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: { status?: string; deliveryTimeline?: any; attempts?: number } = {};
  let shouldUnsetError = false;

  if (body.status) {
    updateData.status = body.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (log.deliveryTimeline as any[]) || [];
    timeline.push({
      status: body.status,
      timestamp: new Date(),
      message: body.message || `Status changed to ${body.status}`,
    });
    updateData.deliveryTimeline = timeline;
  }

  if (body.retry) {
    updateData.status = "queued";
    updateData.attempts = (log.attempts || 0) + 1;
    shouldUnsetError = true;
  }

  const updateOp: Record<string, unknown> = {
    $set: { ...updateData, updatedAt: new Date() },
  };
  if (shouldUnsetError) {
    updateOp.$unset = { error: "" };
  }
  await collection.updateOne({ id: params.id, userId: session.user.id }, updateOp);
  const updated = await collection.findOne({ id: params.id, userId: session.user.id });

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

  const { log, collectionName } = await findLog(session.user.id, params.id);
  if (!log) return error("Not found", 404);

  const collection = collectionName === "email_logs"
    ? await getCollection<EmailLog>("email_logs")
    : await getCollection<SmsLog>("sms_logs");
  await collection.deleteOne({ id: params.id, userId: session.user.id });
  return json({ success: true });
}
