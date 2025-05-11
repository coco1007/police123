import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
    }

    const { status } = await req.json();
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('examRegistrations').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: '시험 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '시험 신청 상태가 업데이트되었습니다.' });
  } catch (error) {
    console.error('시험 신청 상태 업데이트 오류:', error);
    return NextResponse.json({ message: '시험 신청 상태 업데이트에 실패했습니다.' }, { status: 500 });
  }
} 