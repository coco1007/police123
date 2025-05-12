import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    const connection = await connectDB();
    const isConnected = connection.connection.readyState === 1;
    
    return NextResponse.json({
      status: 'success',
      database: {
        connected: isConnected,
        state: connection.connection.readyState,
        host: connection.connection.host,
        name: connection.connection.name
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 