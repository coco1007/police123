'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

interface Exam {
  _id: string;
  title: string;
  description: string;
  code: string;
}

export default function Home() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examCodes, setExamCodes] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      setExams(data);
      // 각 시험의 코드 입력 필드 초기화
      const initialCodes = data.reduce((acc: { [key: string]: string }, exam: Exam) => {
        acc[exam._id] = '';
        return acc;
      }, {});
      setExamCodes(initialCodes);
    } catch (error) {
      toast.error('시험 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (examId: string, value: string) => {
    setExamCodes(prev => ({
      ...prev,
      [examId]: value
    }));
  };

  const verifyCode = async (examId: string) => {
    const code = examCodes[examId];
    if (!code) {
      toast.error('코드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/exams/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId, code }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('코드가 확인되었습니다.');
        router.push(`/exam/${examId}`);
      } else {
        toast.error(data.error || '코드 확인에 실패했습니다.');
      }
    } catch (error) {
      toast.error('코드 확인 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">응시 가능한 시험 목록</h1>
      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam._id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
            <p className="text-gray-600 mb-4">{exam.description}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={examCodes[exam._id] || ''}
                onChange={(e) => handleCodeChange(exam._id, e.target.value)}
                placeholder="시험 코드를 입력하세요"
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => verifyCode(exam._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                확인
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
