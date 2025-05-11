import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { examType, examDate } = await request.json();

    if (!examType || !examDate) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // 이미 신청한 시험이 있는지 확인
    const existingApplication = await db.collection('examApplications').findOne({
      userId: session.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 신청한 시험이 있습니다.' },
        { status: 400 }
      );
    }

    const result = await db.collection('examApplications').insertOne({
      userId: session.user.id,
      examType,
      examDate,
      status: 'pending',
      viewed: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: '시험 신청이 완료되었습니다.', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('시험 신청 오류:', error);
    return NextResponse.json(
      { error: '시험 신청에 실패했습니다.' },
      { status: 500 }
    );
  }
} 