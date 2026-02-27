import { NextRequest } from "next/server";
import { json, error, serialize, serializeMany } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/templates — list all templates */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const templatesCollection = await getCollection("templates");
  const templates = await templatesCollection
    .find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .toArray();

  return json(serializeMany(templates));
}

/** POST /api/templates — create a new template */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await req.json();
    const { name, type, subject, content, variables } = body;
    if (!name || !type || !content) return error("name, type, and content are required");

    const templatesCollection = await getCollection("templates");
    const now = new Date();

    const template = {
      id: randomUUID(),
      name,
      type,
      subject,
      content,
      variables: Array.isArray(variables) ? variables : [],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      userId: session.user.id,
    };

    await templatesCollection.insertOne(template);

    return json(serialize(template), 201);
  } catch (e) {
    console.error("POST /api/templates error:", e);
    return error("Failed to create template", 500);
  }
}
