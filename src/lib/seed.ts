import { getCollection } from './mongodb';
import { User, Settings } from './schema';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting MongoDB seed...');

    // Get collections
    const usersCollection = await getCollection<User>('users');
    const settingsCollection = await getCollection<Settings>('settings');

    // Check if admin user exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@notifyhub.com' });
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser: User = {
        id: 'admin-user-id',
        name: 'Admin User',
        email: 'admin@notifyhub.com',
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'PREMIUM',
        emailUsed: 0,
        smsUsed: 0,
        planStartDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await usersCollection.insertOne(adminUser);
      console.log('✅ Admin user created');

      // Create default settings for admin
      const defaultSettings: Settings = {
        id: 'admin-settings-id',
        orgName: 'NotifyHub',
        timezone: 'UTC',
        retryEnabled: true,
        maxRetries: 3,
        webhookUrl: '',
        emailProvider: 'smtp',
        emailConfig: {},
        smsProvider: 'twilio',
        smsConfig: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: adminUser.id,
      };

      await settingsCollection.insertOne(defaultSettings);
      console.log('✅ Default settings created');
    }

    console.log('✅ MongoDB seed completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
