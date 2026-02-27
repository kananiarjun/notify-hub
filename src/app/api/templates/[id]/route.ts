import { NextRequest } from "next/server";
import { json, error, serialize } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { Template } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/templates/[id] */
export async function GET(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const templates = await getCollection<Template>("templates");
  const template = await templates.findOne({ id: params.id, userId: session.user.id });

  if (!template) return error("Not found", 404);
  return json(serialize(template));
}

/** PATCH /api/templates/[id] */
export async function PATCH(req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const body = await req.json();

  const templates = await getCollection<Template>("templates");
  const template = await templates.findOne({ id: params.id, userId: session.user.id });

  if (!template) return error("Not found", 404);

  const now = new Date();
  await templates.updateOne(
    { id: params.id, userId: session.user.id },
    { $set: { ...body, updatedAt: now } }
  );
  const updated = await templates.findOne({ id: params.id, userId: session.user.id });

  if (!updated) return error("Not found", 404);
  return json(serialize(updated));
}

/** DELETE /api/templates/[id] */
export async function DELETE(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const templates = await getCollection<Template>("templates");
  const template = await templates.findOne({ id: params.id, userId: session.user.id });

  if (!template) return error("Not found", 404);

  await templates.deleteOne({ id: params.id, userId: session.user.id });
  return json({ success: true });
}
