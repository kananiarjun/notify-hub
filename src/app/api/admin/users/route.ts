import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import type { User } from '@/lib/schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getCollection<User>('users');
    const users = await usersCollection
      .find(
        {},
        { projection: { id: 1, name: 1, email: 1, role: 1, plan: 1, emailUsed: 1, smsUsed: 1, isActive: 1, planStartDate: 1, createdAt: 1 } }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
