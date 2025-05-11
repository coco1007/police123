import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password, name, rank, approvalCode } = await request.json();

    if (!username || !password || !name || !rank || !approvalCode) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // 승인 번호 확인
    const currentApprovalCode = await db.collection('approvalCodes').findOne({ codeId: 'current' });
    
    if (!currentApprovalCode || currentApprovalCode.code !== approvalCode) {
      return NextResponse.json(
        { message: '유효하지 않은 승인 번호입니다.' },
        { status: 400 }
      );
    }

    // 사용자 이름 중복 확인
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: '이미 사용 중인 아이디입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      name,
      rank,
      role: 'user',
      approved: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 