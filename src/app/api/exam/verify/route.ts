import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Exam from '@/models/Exam';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { password } = await req.json();
    await connectDB();

    const exam = await Exam.findOne({ 
      password,
      isActive: true 
    });

    if (!exam) {
      return NextResponse.json(
        { message: '유효하지 않은 시험 비밀번호입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호는 제외하고 반환
    const { password: _, ...examData } = exam.toObject();
    return NextResponse.json(examData);
  } catch (error: any) {
    console.error('Error verifying exam:', error);
    return NextResponse.json(
      { message: '시험 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 