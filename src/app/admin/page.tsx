'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Exam {
  _id: string;
  title: string;
  description: string;
  code: string;
  codeGeneratedAt: string;
  codeExpiresAt: string;
}

export default function AdminPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams');
      const data = await response.json();
      setExams(data);
    } catch (error) {
      toast.error('시험 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = async (examId: string) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}/code`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('새로운 코드가 생성되었습니다.');
        fetchExams();
      } else {
        toast.error('코드 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error('코드 생성 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    fetchExams();
    const interval = setInterval(fetchExams, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">시험 관리</h1>
          <button
            onClick={() => router.push('/admin/submissions')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            제출물 목록
          </button>
        </div>

        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam._id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
              <p className="text-gray-600 mb-2">{exam.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">현재 코드: {exam.code}</p>
                  <p className="text-sm text-gray-500">
                    생성 시간: {formatDate(exam.codeGeneratedAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    만료 시간: {formatDate(exam.codeExpiresAt)}
                  </p>
                </div>
                <button
                  onClick={() => generateNewCode(exam._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  새 코드 생성
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 