import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import ExamSubmission from '@/models/ExamSubmission';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { studentId, studentName, answers } = await request.json();

    const exam = await Exam.findById(context.params.id);
    if (!exam) {
      return NextResponse.json(
        { error: '시험을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 답안 저장
    const submission = await ExamSubmission.create({
      exam: exam._id,
      studentId,
      studentName,
      answers,
      submittedAt: new Date()
    });

    return NextResponse.json({ 
      message: '답안이 제출되었습니다.',
      submissionId: submission._id 
    });
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 