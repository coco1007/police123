import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    // 시험 신청 목록과 사용자 정보를 함께 조회
    const applications = await db.collection('examApplications')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            examType: 1,
            examDate: 1,
            status: 1,
            viewed: 1,
            createdAt: 1,
            'user.name': 1,
            'user.email': 1,
            'user.rank': 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('시험 신청 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '시험 신청 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { examType, examDate } = await request.json();

    if (!examType || !examDate) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // 이미 신청한 시험이 있는지 확인
    const existingApplication = await db.collection('examApplications').findOne({
      userId: session.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 신청한 시험이 있습니다.' },
        { status: 400 }
      );
    }

    const result = await db.collection('examApplications').insertOne({
      userId: session.user.id,
      examType,
      examDate,
      status: 'pending',
      viewed: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: '시험 신청이 완료되었습니다.', id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('시험 신청 오류:', error);
    return NextResponse.json(
      { error: '시험 신청에 실패했습니다.' },
      { status: 500 }
    );
  }
} 