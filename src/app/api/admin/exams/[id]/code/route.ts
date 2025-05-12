import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const exam = await Exam.findById(params.id);
    if (!exam) {
      return NextResponse.json({ error: '시험을 찾을 수 없습니다.' }, { status: 404 });
    }

    const newCode = generateCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

    exam.code = newCode;
    exam.codeGeneratedAt = now;
    exam.codeExpiresAt = expiresAt;
    await exam.save();

    return NextResponse.json(exam);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 