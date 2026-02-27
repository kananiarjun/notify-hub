import { json, error, serializeMany } from "@/app/api/_helpers";
import { getCollection } from "@/lib/mongodb";
import type { TeamMember } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** GET /api/team */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return error("Unauthorized", 401);
  }

  const teamMembersCollection = await getCollection<TeamMember>("team_members");
  const teamMembers = await teamMembersCollection
    .find({ userId: session.user.id })
    .sort({ createdAt: 1 })
    .toArray();

  return json(serializeMany(teamMembers));
}
