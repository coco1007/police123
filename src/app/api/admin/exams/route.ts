import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Exam from '@/models/Exam';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 시험 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    await connectDB();
    const exams = await Exam.find().sort({ createdAt: -1 });
    return NextResponse.json(exams);
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { message: '시험 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 새 시험 추가
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const data = await req.json();
    await connectDB();

    // 필수 필드 검증
    if (!data.title || !data.password || !data.questions || data.questions.length === 0) {
      return NextResponse.json(
        { message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const exam = new Exam(data);
    await exam.save();

    return NextResponse.json(
      { message: '시험이 성공적으로 추가되었습니다.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { message: '시험 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 