import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Exam from '@/models/Exam';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { examId, answers } = await req.json();
    await connectDB();

    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json(
        { message: '시험을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 답안 채점
    let totalScore = 0;
    const results = exam.questions.map((question: any) => {
      const userAnswer = answers[question.questionNumber];
      let score = 0;
      let isCorrect = false;

      if (question.questionType === 'OX' || question.questionType === '객관식') {
        if (question.questionType === 'OX') {
          isCorrect = userAnswer === question.correctAnswer;
        } else {
          const correctOption = question.options.findIndex((opt: any) => opt.isCorrect);
          isCorrect = parseInt(userAnswer) === correctOption + 1;
        }
        score = isCorrect ? question.points : 0;
      } else {
        // 서술형은 관리자가 수동으로 채점
        score = 0;
      }

      totalScore += score;
      return {
        questionNumber: question.questionNumber,
        userAnswer,
        correctAnswer: question.correctAnswer,
        score,
        maxPoints: question.points,
      };
    });

    // 결과 저장
    // TODO: ExamResult 모델을 만들어서 결과 저장 구현

    return NextResponse.json({
      totalScore,
      results,
    });
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { message: '시험 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 