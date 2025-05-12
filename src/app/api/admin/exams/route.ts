import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function GET() {
  try {
    await connectDB();
    const exams = await Exam.find({});
    return NextResponse.json(exams);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 