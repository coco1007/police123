import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = params;

    const { db } = await connectToDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { approved: true } }
    );

    return NextResponse.json({ message: '사용자가 승인되었습니다.' });
  } catch (error) {
    console.error('사용자 승인 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 