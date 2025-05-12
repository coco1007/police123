import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function POST(request: Request) {
  try {
    const { examId, code } = await request.json();
    
    if (!examId || !code) {
      return NextResponse.json(
        { error: '시험 ID와 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    await connectDB();
    const exam = await Exam.findById(examId);

    if (!exam) {
      return NextResponse.json(
        { error: '시험을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now > exam.codeExpiresAt) {
      return NextResponse.json(
        { error: '만료된 코드입니다.' },
        { status: 400 }
      );
    }

    if (exam.code !== code) {
      return NextResponse.json(
        { error: '잘못된 코드입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 