import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

const SETUP_KEY = 'police-exam-setup-2024'; // 보안을 위해 실제 운영 환경에서는 환경 변수로 관리해야 합니다.

export async function POST(req: Request) {
  try {
    const { username, password, setupKey } = await req.json();

    // 설정 키 확인
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json(
        { message: '유효하지 않은 설정 키입니다.' },
        { status: 401 }
      );
    }

    await connectDB();

    // 이미 관리자 계정이 존재하는지 확인
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { message: '관리자 계정이 이미 존재합니다.' },
        { status: 400 }
      );
    }

    // 관리자 계정 생성
    const admin = new User({
      username,
      password,
      role: 'admin',
      isApproved: true
    });

    await admin.save();

    return NextResponse.json(
      { message: '관리자 계정이 성공적으로 생성되었습니다.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { message: '관리자 계정 생성 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 