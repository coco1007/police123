import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';

export async function GET() {
  return await POST();
}

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    // 이미 관리자 계정이 있는지 확인
    const existingAdmin = await db.collection('users').findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: '이미 관리자 계정이 존재합니다.' }, { status: 400 });
    }

    // 비밀번호 해시화
    const hashedPassword = await hash('policep', 12);

    // 관리자 계정 생성
    await db.collection('users').insertOne({
      username: 'policea',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    });

    return NextResponse.json({ message: '관리자 계정이 생성되었습니다.' });
  } catch (error) {
    console.error('관리자 계정 생성 오류:', error);
    return NextResponse.json({ error: '관리자 계정 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 