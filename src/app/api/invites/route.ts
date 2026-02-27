import { NextRequest } from "next/server";
import { json, error, serialize, serializeMany } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { Invite } from "@/lib/schema";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/invites */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const invitesCollection = await getCollection<Invite>("invites");
  const invites = await invitesCollection
    .find({ userId: session.user.id })
    .sort({ sentAt: -1 })
    .toArray();

  return json(serializeMany(invites));
}

/** POST /api/invites */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await req.json();
    const { email, role } = body;
    if (!email) return error("email is required");

    const invitesCollection = await getCollection<Invite>("invites");
    const exists = await invitesCollection.findOne({ email });

    if (exists) return error("Already invited");

    const invite: Invite = {
      id: randomUUID(),
      email,
      role: role || "developer",
      sentAt: new Date(),
      userId: session.user.id,
    };

    await invitesCollection.insertOne(invite);

    return json(serialize(invite), 201);
  } catch (e) {
    console.error("POST /api/invites error:", e);
    return error("Failed to create invite", 500);
  }
}
