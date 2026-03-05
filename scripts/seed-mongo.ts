import { getCollection } from '../src/lib/mongodb';
import bcrypt from 'bcryptjs';
import type { User, Template } from '../src/lib/schema';
import { createUserWithDefaults } from '../src/lib/user-defaults';
import { randomUUID } from 'crypto';

const SAMPLE_TEMPLATES: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    content: '<p>Hi {{name}},</p><p>Welcome aboard. Your account is ready.</p>',
    type: 'email',
    variables: ['name', 'company'],
    usageCount: 0,
  },
  {
    name: 'Password Reset',
    subject: 'Reset Your NotifyHub Password',
    content: '<h2>Password Reset Request</h2><p>Hi {{name}},</p><p>We received a request to reset your password for your NotifyHub account.</p><p><a href="{{resetLink}}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a></p><p>Or copy this link: {{resetLink}}</p><p>This link expires in 1 hour.</p><p>If you didn\'t request this, please ignore this email.</p><br><p>Best regards,<br>The NotifyHub Team</p>',
    type: 'email',
    variables: ['name', 'resetLink'],
    usageCount: 0,
  },
  {
    name: 'Email Verification',
    subject: 'Verify Your Email - Welcome to NotifyHub',
    content: '<h2>Welcome to NotifyHub!</h2><p>Hi {{name}},</p><p>Thank you for signing up. Please verify your email address to activate your account.</p><p><a href="{{verificationLink}}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Verify Email</a></p><p>Or copy this link: {{verificationLink}}</p><p>This link expires in 24 hours.</p><br><p>Best regards,<br>The NotifyHub Team</p>',
    type: 'email',
    variables: ['name', 'verificationLink'],
    usageCount: 0,
  },
  {
    name: 'Order Confirmation',
    subject: 'Order #{{orderNumber}} Confirmed',
    content: '<p>Hi {{name}},</p><p>Your order #{{orderNumber}} has been confirmed.</p><p>Total: ${{amount}}</p><p>Track your order: {{trackingLink}}</p>',
    type: 'email',
    variables: ['name', 'orderNumber', 'amount', 'trackingLink'],
    usageCount: 0,
  },
  {
    name: 'Shipping Notification',
    subject: 'Your order #{{orderNumber}} has shipped!',
    content: '<p>Hi {{name}},</p><p>Good news! Your order has shipped.</p><p>Tracking number: {{trackingNumber}}</p><p>Expected delivery: {{deliveryDate}}</p>',
    type: 'email',
    variables: ['name', 'orderNumber', 'trackingNumber', 'deliveryDate'],
    usageCount: 0,
  },
  {
    name: 'Invoice Ready',
    subject: 'Invoice #{{invoiceNumber}} is ready',
    content: '<p>Hi {{name}},</p><p>Your invoice #{{invoiceNumber}} is ready.</p><p>Amount due: ${{amount}}</p><p>Due date: {{dueDate}}</p><p>View invoice: {{invoiceLink}}</p>',
    type: 'email',
    variables: ['name', 'invoiceNumber', 'amount', 'dueDate', 'invoiceLink'],
    usageCount: 0,
  },
  {
    name: 'Appointment Reminder',
    subject: 'Reminder: Appointment on {{date}}',
    content: '<p>Hi {{name}},</p><p>This is a reminder about your appointment on {{date}} at {{time}}.</p><p>Location: {{location}}</p><p>Reschedule: {{rescheduleLink}}</p>',
    type: 'email',
    variables: ['name', 'date', 'time', 'location', 'rescheduleLink'],
    usageCount: 0,
  },
  {
    name: 'Newsletter',
    subject: '{{company}} Newsletter - {{month}} {{year}}',
    content: '<p>Hi {{name}},</p><p>Check out our {{month}} {{year}} newsletter!</p><p>{{content}}</p><p>Unsubscribe: {{unsubscribeLink}}</p>',
    type: 'email',
    variables: ['name', 'company', 'month', 'year', 'content', 'unsubscribeLink'],
    usageCount: 0,
  },
  {
    name: 'SMS Alert',
    subject: '',
    content: 'Alert: {{message}}',
    type: 'sms',
    variables: ['message'],
    usageCount: 0,
  },
  {
    name: 'SMS Verification',
    subject: '',
    content: 'Your verification code is: {{code}}. Valid for {{minutes}} minutes.',
    type: 'sms',
    variables: ['code', 'minutes'],
    usageCount: 0,
  },
  {
    name: 'SMS Appointment Reminder',
    subject: '',
    content: 'Reminder: Appointment on {{date}} at {{time}}. Location: {{location}}. Reply CANCEL to reschedule.',
    type: 'sms',
    variables: ['date', 'time', 'location'],
    usageCount: 0,
  },
  {
    name: 'SMS Order Update',
    subject: '',
    content: 'Order #{{orderNumber}}: {{status}}. Track: {{trackingLink}}',
    type: 'sms',
    variables: ['orderNumber', 'status', 'trackingLink'],
    usageCount: 0,
  },
];

async function seed() {
  console.log('🌱 Starting MongoDB seed...');

  const users = await getCollection<User>('users');
  const templates = await getCollection<Template>('templates');

  // 1) Create a demo admin user (if not exists)
  const demoEmail = 'admin@notifyhub.local';
  const existing = await users.findOne({ email: demoEmail });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 12);
    const now = new Date();
    const adminUser = createUserWithDefaults({
      name: 'Demo Admin',
      email: demoEmail,
      password: hashed,
      role: 'ADMIN',
      plan: 'PREMIUM',
    });
    await users.insertOne(adminUser);
    console.log('✅ Created demo admin:', demoEmail);
  } else {
    console.log('ℹ️ Demo admin already exists');
  }

  // 2) Insert sample templates for the demo user
  const admin = (await users.findOne({ email: demoEmail }))!;
  for (const tpl of SAMPLE_TEMPLATES) {
    const exists = await templates.findOne({ name: tpl.name, userId: admin.id });
    if (!exists) {
      const now = new Date();
      const newTemplate: Template = {
        id: randomUUID(),
        ...tpl,
        userId: admin.id,
        createdAt: now,
        updatedAt: now,
      };
      await templates.insertOne(newTemplate);
      console.log(`✅ Created template: ${tpl.name}`);
    } else {
      console.log(`ℹ️ Template "${tpl.name}" already exists`);
    }
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
