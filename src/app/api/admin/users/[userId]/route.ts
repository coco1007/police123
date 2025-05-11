import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = params;
    const data = await request.json();

    const { db } = await connectToDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: data }
    );

    return NextResponse.json({ message: '사용자 정보가 업데이트되었습니다.' });
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 