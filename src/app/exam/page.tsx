'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExamType {
  _id: string;
  title: string;
  isActive: boolean;
}

export default function ExamPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [availableExams, setAvailableExams] = useState<ExamType[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      const res = await fetch('/api/admin/exams');
      const data = await res.json();
      if (res.ok) {
        setAvailableExams(data.filter((exam: ExamType) => exam.isActive));
      }
    } catch (err) {
      setError('시험 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedExam) {
      setError('날짜와 시험을 선택해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/exam/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: selectedExam,
          examDate: selectedDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('시험 신청이 완료되었습니다.');
        setTimeout(() => {
          router.push('/exam');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('시험 신청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">진급시험 신청</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시험 선택
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">시험을 선택하세요</option>
              {availableExams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시험 날짜 선택
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full p-2 border rounded"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              * 오늘로부터 7일 이내의 날짜만 선택 가능합니다.
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            시험 신청
          </button>
        </form>
      </div>
    </div>
  );
} 