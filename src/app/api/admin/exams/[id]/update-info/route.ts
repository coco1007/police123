import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const exam = await Exam.findById(context.params.id);
    if (!exam) {
      return NextResponse.json(
        { error: '시험을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { title, timeLimit } = await request.json();
    
    if (title) exam.title = title;
    if (timeLimit) exam.timeLimit = timeLimit;
    
    await exam.save();

    return NextResponse.json({
      message: '시험 정보가 업데이트되었습니다.',
      exam
    });
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 