import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminCode from '@/models/AdminCode';
import crypto from 'crypto';

// 랜덤 코드 생성 함수
function generateCode(length: number = 8): string {
  return crypto.randomBytes(length).toString('hex').toUpperCase();
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const codes = await AdminCode.find().sort({ createdAt: -1 });
    return NextResponse.json(codes);
  } catch (error) {
    console.error('Error fetching admin codes:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { expiresIn } = await req.json();
    await connectDB();

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresIn);

    const adminCode = new AdminCode({
      code,
      expiresAt,
    });

    await adminCode.save();

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error generating admin code:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 