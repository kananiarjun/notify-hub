import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import type { User } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, newPlan } = await req.json();
    if (!userId || !newPlan) {
      return NextResponse.json({ error: 'Missing userId or newPlan' }, { status: 400 });
    }

    const users = await getCollection<User>('users');
    const now = new Date();
    await users.updateOne(
      { id: userId },
      { $set: { plan: newPlan, emailUsed: 0, smsUsed: 0, planStartDate: now, updatedAt: now } }
    );
    const updatedUser = await users.findOne({ id: userId });

    return NextResponse.json({ message: 'Plan updated successfully', user: updatedUser }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
