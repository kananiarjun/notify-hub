import { NextRequest } from "next/server";
import { json, error, serialize } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { Settings } from "@/lib/schema";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/settings */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const settingsCollection = await getCollection<Settings>("settings");
  const existingSettings = (await settingsCollection.findOne({ userId: session.user.id })) as Settings | null;

  if (existingSettings) {
    return json(serialize(existingSettings));
  }

  const now = new Date();
  const newSettings: Settings = {
    id: randomUUID(),
    orgName: "NotifyHub",
    timezone: "UTC",
    retryEnabled: true,
    maxRetries: 3,
    webhookUrl: "",
    emailProvider: "smtp",
    emailConfig: {},
    smsProvider: "twilio",
    smsConfig: {},
    createdAt: now,
    updatedAt: now,
    userId: session.user.id,
  };
  await settingsCollection.insertOne(newSettings);

  return json(serialize(newSettings));
}

/** PATCH /api/settings — update settings */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await req.json();

    const settingsCollection = await getCollection<Settings>("settings");
    const now = new Date();

    await settingsCollection.updateOne(
      { userId: session.user.id },
      {
        $set: {
          ...body,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
          userId: session.user.id,
        },
      },
      { upsert: true }
    );

    const settings = await settingsCollection.findOne({ userId: session.user.id });

    if (!settings) {
      return error("Not found", 404);
    }

    return json(serialize(settings));
  } catch (e) {
    console.error("PATCH /api/settings error:", e);
    return error("Failed to update settings", 500);
  }
}
