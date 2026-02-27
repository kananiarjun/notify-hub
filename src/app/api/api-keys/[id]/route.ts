import { NextRequest } from "next/server";
import { json, error } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { ApiKey } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


interface Params {
  params: Promise<{ id: string }>;
}

/** DELETE /api/api-keys/[id] — revoke */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(_req: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const apiKeys = await getCollection<ApiKey>("api_keys");
  const apiKey = await apiKeys.findOne({ id: params.id, userId: session.user.id });

  if (!apiKey) return error("Not found", 404);

  await apiKeys.deleteOne({ id: params.id, userId: session.user.id });
  return json({ success: true });
}
