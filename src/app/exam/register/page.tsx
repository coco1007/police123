'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Exam {
  _id: string;
  title: string;
  description: string;
  duration: number;
  isActive: boolean;
}

export default function ExamRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examDate, setExamDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchExams();
  }, [session, router]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data.filter((exam: Exam) => exam.isActive));
      }
    } catch (error) {
      setError('시험 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/exam/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: selectedExam,
          examDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/exam/my-exams');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('시험 신청 중 오류가 발생했습니다.');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">진급시험 신청</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="exam" className="block text-sm font-medium text-gray-700 mb-2">
              시험 선택
            </label>
            <select
              id="exam"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">시험을 선택하세요</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 mb-2">
              시험 날짜
            </label>
            <input
              type="date"
              id="examDate"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            시험 신청하기
          </button>
        </form>
      </div>
    </div>
  );
} 