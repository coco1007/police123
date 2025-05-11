import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await connectDB();
    console.log('Successfully connected to MongoDB!');
    
    return NextResponse.json({ 
      message: '데이터베이스 연결 성공!',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        message: '데이터베이스 연결 실패',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 