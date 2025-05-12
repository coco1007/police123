import { NextResponse } from 'next/server';
import { use } from 'react';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = use(context.params);
    const { studentId, studentName } = await request.json();

    if (!studentId || !studentName) {
      return NextResponse.json(
        { error: '고유번호와 이름을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    await connectDB();
    const exam = await Exam.findById(resolvedParams.id);
    if (!exam) {
      return NextResponse.json(
        { error: '시험을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 시험 시작 시간을 기록하고 응답
    return NextResponse.json({
      message: '시험이 시작되었습니다.',
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        totalPoints: exam.totalPoints,
        questions: exam.questions
      }
    });
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 