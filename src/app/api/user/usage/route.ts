import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyMonthlyReset, PLAN_LIMITS } from '@/lib/subscription';
import { getCollection } from '@/lib/mongodb';
import type { User } from '@/lib/schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getCollection<User>('users');
    const user = await users.findOne(
      { id: session.user.id },
      { projection: { plan: 1, emailUsed: 1, smsUsed: 1, planStartDate: 1, isActive: 1, id: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Attempt monthly reset if needed before showing usage
    const updatedUser = await applyMonthlyReset(user as User);

    const limitEmail = PLAN_LIMITS[updatedUser.plan as keyof typeof PLAN_LIMITS].email;
    const limitSms = PLAN_LIMITS[updatedUser.plan as keyof typeof PLAN_LIMITS].sms;

    return NextResponse.json({
      plan: updatedUser.plan,
      emailUsed: updatedUser.emailUsed,
      smsUsed: updatedUser.smsUsed,
      limitEmail,
      limitSms,
      isActive: updatedUser.isActive,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
