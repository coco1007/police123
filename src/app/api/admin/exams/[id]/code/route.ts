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

    // 새로운 코드 생성 및 저장
    const newCode = generateCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

    const updatedExam = await Exam.findByIdAndUpdate(
      params.id,
      {
        $set: {
          code: newCode,
          codeGeneratedAt: now,
          codeExpiresAt: expiresAt
        }
      },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ error: '시험 업데이트에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json(updatedExam);
  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 