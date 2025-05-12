import 'dotenv/config';
import connectDB from '../lib/mongodb';
import Exam from '../models/Exam';

const now = new Date();
const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

const exams = [
  {
    title: '순경 → 경장 승진시험',
    description: '순경에서 경장으로의 승진시험입니다.',
    code: 'SUNJUNG2024',
    isActive: true,
    codeGeneratedAt: now,
    codeExpiresAt: expiresAt,
  },
  {
    title: '경장 → 경사 승진시험',
    description: '경장에서 경사로의 승진시험입니다.',
    code: 'GYEONGJANG2024',
    isActive: true,
    codeGeneratedAt: now,
    codeExpiresAt: expiresAt,
  },
  {
    title: '경사 → 경위 승진시험',
    description: '경사에서 경위로의 승진시험입니다.',
    code: 'GYEONGSA2024',
    isActive: true,
    codeGeneratedAt: now,
    codeExpiresAt: expiresAt,
  },
];

async function seedExams() {
  try {
    await connectDB();
    
    // 기존 시험 데이터 삭제
    await Exam.deleteMany({});
    
    // 새로운 시험 데이터 추가
    await Exam.insertMany(exams);
    
    console.log('시험 데이터가 성공적으로 추가되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('시험 데이터 추가 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

seedExams(); 