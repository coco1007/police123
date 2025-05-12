import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamSubmission from '@/models/ExamSubmission';
import Exam from '@/models/Exam';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
    await connectDB();
    
    const submission = await ExamSubmission.findById(id)
      .populate('exam');

    if (!submission) {
      return NextResponse.json(
        { error: '제출물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 