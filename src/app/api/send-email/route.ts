import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canSendEmail } from '@/lib/subscription';
import { getCollection } from '@/lib/mongodb';
import type { User } from '@/lib/schema';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const allowed = await canSendEmail(userId);

    if (!allowed) {
      return NextResponse.json({ error: 'Email limit exceeded or account disabled' }, { status: 403 });
    }

    const { to, subject, text } = await req.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock Email sending using nodemailer for dev or simple setup (in production use something like Resend/Sendgrid)
    /*
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'test',
        pass: 'pass'
      }
    });
    await transporter.sendMail({ from: '"Notify Hub" <no-reply@notifyhub.com>', to, subject, text });
    */

    // Increment email usage
    const users = await getCollection<User>('users');
    await users.updateOne({ id: userId }, { $inc: { emailUsed: 1 }, $set: { updatedAt: new Date() } });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
