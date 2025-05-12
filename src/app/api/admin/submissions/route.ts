import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ExamSubmission from '@/models/ExamSubmission';
import Exam from '@/models/Exam';

export async function GET() {
  try {
    await connectDB();
    
    const submissions = await ExamSubmission.find()
      .populate('exam', 'title')
      .sort({ submittedAt: -1 });

    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 