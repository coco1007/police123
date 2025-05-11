import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password, name, rank, approvalCode } = await request.json();

    if (!username || !password || !name || !rank || !approvalCode) {
      return new NextResponse(
        JSON.stringify({ message: '모든 필드를 입력해주세요.' }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // 승인코드 확인
    const userWithCode = await db.collection('users').findOne({ approvalCode });
    if (!userWithCode) {
      return new NextResponse(
        JSON.stringify({ message: '유효하지 않은 승인코드입니다.' }),
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ message: '이미 등록된 이메일입니다.' }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      name,
      rank,
      role: 'user',
      approved: false,
      createdAt: new Date(),
      canSelectExam: false
    });

    return NextResponse.json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return new NextResponse(
      JSON.stringify({ message: '회원가입 중 오류가 발생했습니다.' }),
      { status: 500 }
    );
  }
} 