import { NextRequest } from "next/server";
import { json, error, serialize, serializeMany } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { ApiKey } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

/** GET /api/api-keys */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const apiKeysCollection = await getCollection<ApiKey>("api_keys");
  const apiKeys = await apiKeysCollection
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return json(serializeMany(apiKeys));
}

/** POST /api/api-keys — create a new key */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await req.json();
    const { name, permissions } = body;
    if (!name) return error("name is required");

    const key = `nk_live_${crypto.randomBytes(24).toString("hex")}`;

    const apiKeysCollection = await getCollection<ApiKey>("api_keys");
    const now = new Date();
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      name,
      key,
      permissions: permissions || ["send", "read"],
      isActive: true,
      usageCount: 0,
      createdAt: now,
      userId: session.user.id,
    };

    await apiKeysCollection.insertOne(apiKey);

    return json(serialize(apiKey), 201);
  } catch (e) {
    console.error("POST /api/api-keys error:", e);
    return error("Failed to create API key", 500);
  }
}
