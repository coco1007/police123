import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // 이미 관리자 계정이 있는지 확인
    const existingAdmin = await db.collection('users').findOne({ role: 'admin' });
    if (existingAdmin) {
      return new NextResponse(
        JSON.stringify({ message: '이미 관리자 계정이 존재합니다.' }),
        { status: 400 }
      );
    }

    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('policep', 10);
    await db.collection('users').insertOne({
      username: 'policea',
      password: hashedPassword,
      name: '관리자',
      rank: '관리자',
      role: 'admin',
      approved: true,
      createdAt: new Date(),
      canSelectExam: true
    });

    return NextResponse.json({ 
      message: '관리자 계정이 생성되었습니다.',
      username: 'policea',
      password: 'policep'
    });
  } catch (error) {
    console.error('관리자 계정 생성 오류:', error);
    return new NextResponse(
      JSON.stringify({ message: '관리자 계정 생성 중 오류가 발생했습니다.' }),
      { status: 500 }
    );
  }
} 