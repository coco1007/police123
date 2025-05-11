import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ExamResult from '@/models/ExamResult';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    const results = await ExamResult.find({ userId: session.user.id })
      .populate('examId', 'title')
      .sort({ submittedAt: -1 });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { message: '시험 결과를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 