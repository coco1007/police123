import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { status, viewed } = await request.json();

    if (status && !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const updateData: any = { updatedAt: new Date() };
    
    if (status) updateData.status = status;
    if (viewed !== undefined) updateData.viewed = viewed;

    const result = await db.collection('examApplications').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '시험 신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '상태가 업데이트되었습니다.' });
  } catch (error) {
    console.error('시험 신청 상태 업데이트 오류:', error);
    return NextResponse.json(
      { error: '상태 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 