import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI가 설정되지 않았습니다.');
}

const examId = new ObjectId('682203b8758e31eab41f1cbd');

async function updateExamInfo() {
  const client = await MongoClient.connect(MONGODB_URI as string);
  try {
    const db = client.db();
    const result = await db.collection('exams').updateOne(
      { _id: examId },
      {
        $set: {
          title: '순경 → 경장 승진시험',
          timeLimit: 20 // 20분
        }
      }
    );

    if (result.matchedCount === 0) {
      console.error('시험을 찾을 수 없습니다.');
      return;
    }

    console.log('시험 정보가 업데이트되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.close();
  }
}

updateExamInfo(); 