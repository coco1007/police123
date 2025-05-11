import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';

// 문제 목록 조회
export async function GET() {
  try {
    await connectDB();
    const questions = await Question.find().sort({ createdAt: -1 });
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { message: '문제 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 새 문제 추가
export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectDB();

    // 정답이 하나만 선택되었는지 확인
    const correctAnswers = data.options.filter((opt: any) => opt.isCorrect).length;
    if (correctAnswers !== 1) {
      return NextResponse.json(
        { message: '정답은 반드시 하나만 선택해야 합니다.' },
        { status: 400 }
      );
    }

    const question = new Question(data);
    await question.save();

    return NextResponse.json(
      { message: '문제가 성공적으로 추가되었습니다.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { message: '문제 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 