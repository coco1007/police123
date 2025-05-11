import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

// 승인 번호 생성 함수
function generateApprovalCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 승인 번호 업데이트 함수
async function updateApprovalCode() {
  const { db } = await connectToDatabase();
  const code = generateApprovalCode();
  const nextUpdate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후

  await db.collection('approvalCodes').updateOne(
    { codeId: 'current' },
    { $set: { code, nextUpdate } },
    { upsert: true }
  );

  return { code, nextUpdate };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { db } = await connectToDatabase();
    const approvalCode = await db.collection('approvalCodes').findOne({ codeId: 'current' });

    if (!approvalCode || new Date(approvalCode.nextUpdate) <= new Date()) {
      // 승인 번호가 없거나 만료된 경우 새로 생성
      const newCode = await updateApprovalCode();
      return NextResponse.json(newCode);
    }

    return NextResponse.json({
      code: approvalCode.code,
      nextUpdate: approvalCode.nextUpdate,
    });
  } catch (error) {
    console.error('승인 번호 조회 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 