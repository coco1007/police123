'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  rank: string;
  canSelectExam: boolean;
}

export default function ExamSelectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('사용자 정보를 불러오는데 실패했습니다.');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!user) return <div className="p-4">사용자 정보를 불러올 수 없습니다.</div>;

  if (!user.canSelectExam) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">
            진급시험 신청 권한이 없습니다. 관리자에게 문의하시기 바랍니다.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const exams = [
    {
      id: '순경-경장',
      title: '순경 → 경장 진급시험',
      description: '순경에서 경장으로의 진급을 위한 시험입니다.',
      duration: 120,
      totalQuestions: 100,
      passingScore: 60
    },
    {
      id: '경장-경사',
      title: '경장 → 경사 진급시험',
      description: '경장에서 경사로의 진급을 위한 시험입니다.',
      duration: 120,
      totalQuestions: 100,
      passingScore: 60
    },
    {
      id: '경사-경위',
      title: '경사 → 경위 진급시험',
      description: '경사에서 경위로의 진급을 위한 시험입니다.',
      duration: 120,
      totalQuestions: 100,
      passingScore: 60
    }
  ];

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">진급시험 선택</h1>
          <Link
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            뒤로가기
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-2">{exam.title}</h2>
              <p className="text-gray-600 mb-4">{exam.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>시험 시간: {exam.duration}분</p>
                <p>문제 수: {exam.totalQuestions}문제</p>
                <p>합격 기준: {exam.passingScore}점</p>
              </div>
              <Link
                href={`/exam/register?type=${exam.id}`}
                className="mt-4 block w-full bg-blue-500 text-white text-center px-4 py-2 rounded hover:bg-blue-600"
              >
                신청하기
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 