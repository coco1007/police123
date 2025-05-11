import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    
    // 시험 신청 목록 조회 (사용자 정보와 시험 정보를 함께 가져옴)
    const registrations = await db.collection('examRegistrations')
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
          $lookup: {
            from: 'exams',
            localField: 'examId',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $unwind: '$exam'
        },
        {
          $project: {
            _id: 1,
            examDate: 1,
            status: 1,
            createdAt: 1,
            'user.name': 1,
            'user.email': 1,
            'exam.title': 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]).toArray();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('시험 신청 목록 조회 오류:', error);
    return NextResponse.json({ message: '시험 신청 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
} 