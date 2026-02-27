import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/mongodb';

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection();
    
    return NextResponse.json({
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: {
        connected: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
