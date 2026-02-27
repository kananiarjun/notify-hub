import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import type { User } from '@/lib/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const users = await getCollection<User>('users');
    const now = new Date();
    await users.updateOne(
      { id: userId },
      { $set: { emailUsed: 0, smsUsed: 0, updatedAt: now } }
    );
    const updatedUser = await users.findOne({ id: userId });

    return NextResponse.json({ message: 'Usage reset successfully', user: updatedUser }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
