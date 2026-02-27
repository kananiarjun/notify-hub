import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canSendSMS } from '@/lib/subscription';
import { getCollection } from '@/lib/mongodb';
import type { User } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const allowed = await canSendSMS(userId);

    if (!allowed) {
      return NextResponse.json({ error: 'SMS limit exceeded or account disabled' }, { status: 403 });
    }

    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock SMS sending using twilio (we just simulate for the requirement, or log it)
    // const client = twilio('ACCOUNT_SID', 'AUTH_TOKEN');
    // await client.messages.create({ body: message, to, from: 'SENDER_NUMBER' });

    // Increment SMS usage
    const users = await getCollection<User>('users');
    await users.updateOne({ id: userId }, { $inc: { smsUsed: 1 }, $set: { updatedAt: new Date() } });

    return NextResponse.json({ message: 'SMS sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
