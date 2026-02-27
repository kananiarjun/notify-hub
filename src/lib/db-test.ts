import { checkDatabaseConnection, getCollection } from '@/lib/mongodb';
import type { User, Template } from '@/lib/schema';

export async function testDatabaseConnection() {
  try {
    return await checkDatabaseConnection();
  } catch (error) {
    console.error('❌ Database connection test: FAILED', error);
    return false;
  }
}

export async function getDatabaseStatus() {
  try {
    // Test connection
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      // Get some basic stats
      const users = await getCollection<User>('users');
      const templates = await getCollection<Template>('templates');
      const [userCount, templateCount] = await Promise.all([
        users.countDocuments({}).catch(() => 0),
        templates.countDocuments({}).catch(() => 0),
      ]);
      
      return {
        status: 'connected',
        userCount,
        templateCount,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'disconnected',
      error: 'Connection failed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting database status:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
