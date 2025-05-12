import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const exams = await Exam.find({
      isActive: true,
      codeExpiresAt: { $gt: now }
    });
    return NextResponse.json(exams);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const examData = await request.json();
    await connectDB();
    
    const exam = await Exam.create(examData);
    return NextResponse.json(exam);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: String(error), stack: error?.stack }, { status: 500 });
  }
} 