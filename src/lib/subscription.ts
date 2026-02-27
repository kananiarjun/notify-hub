import { getCollection } from "@/lib/mongodb";
import type { User } from "@/lib/schema";

export const PLAN_LIMITS = {
  FREE: { email: 5, sms: 0 },
  BASIC: { email: 100, sms: 100 },
  PREMIUM: { email: Infinity, sms: Infinity },
};

export async function applyMonthlyReset(user: User): Promise<User> {
  const now = new Date();
  const planStart = new Date(user.planStartDate);

  const isSameMonth =
    now.getMonth() === planStart.getMonth() &&
    now.getFullYear() === planStart.getFullYear();

  if (!isSameMonth) {
    // Reset limits and update plan start date
    const users = await getCollection<User>("users");
    await users.updateOne(
      { id: user.id },
      {
        $set: {
          emailUsed: 0,
          smsUsed: 0,
          planStartDate: now,
          updatedAt: now,
        },
      }
    );

    const updatedUser = await users.findOne({ id: user.id });
    if (!updatedUser) return user;
    return updatedUser;
  }

  return user;
}

export async function canSendEmail(userId: string): Promise<boolean> {
  const users = await getCollection<User>("users");
  const user = await users.findOne({ id: userId });
  if (!user || !user.isActive) return false;

  const updatedUser = await applyMonthlyReset(user);

  const limit = PLAN_LIMITS[updatedUser.plan as keyof typeof PLAN_LIMITS].email;
  return updatedUser.emailUsed < limit;
}

export async function canSendSMS(userId: string): Promise<boolean> {
  const users = await getCollection<User>("users");
  const user = await users.findOne({ id: userId });
  if (!user || !user.isActive) return false;

  const updatedUser = await applyMonthlyReset(user);

  const limit = PLAN_LIMITS[updatedUser.plan as keyof typeof PLAN_LIMITS].sms;
  return updatedUser.smsUsed < limit;
}
