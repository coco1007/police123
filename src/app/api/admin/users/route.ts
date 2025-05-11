import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { db } = await connectToDatabase();
    const users = await db.collection('users').find({}).toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 