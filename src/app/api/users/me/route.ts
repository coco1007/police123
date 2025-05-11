import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ username: session.user.name });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      rank: user.rank,
      role: user.role,
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { name, rank } = await request.json();
    if (!name || !rank) {
      return NextResponse.json({ error: '이름과 직급은 필수 입력 항목입니다.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('users').updateOne(
      { username: session.user.name },
      { $set: { name, rank } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '사용자 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 