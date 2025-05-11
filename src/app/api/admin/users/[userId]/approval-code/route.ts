import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

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
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    const { db } = await connectToDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { approvalCode: code } }
    );

    return NextResponse.json({ code });
  } catch (error) {
    console.error('승인코드 생성 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 