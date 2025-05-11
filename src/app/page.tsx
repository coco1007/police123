'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import Link from 'next/link';

interface ExamType {
  _id: string;
  title: string;
  isActive: boolean;
}

interface User {
  _id: string;
  username: string;
  name: string;
  rank: string;
  role: string;
  canSelectExam: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [availableExams, setAvailableExams] = useState<ExamType[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 오늘 날짜로부터 7일 이후까지만 선택 가능
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">경찰공무원 진급시험</h1>
        <p className="text-xl text-gray-600">
          경찰공무원 진급시험 온라인 응시 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">결과 확인</h2>
          <p className="text-gray-600 mb-4">
            진급시험 결과를 확인할 수 있습니다.
          </p>
          <Link
            href="/result"
            className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            결과 확인하기
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">공지사항</h2>
          <p className="text-gray-600 mb-4">
            진급시험 관련 공지사항을 확인할 수 있습니다.
          </p>
          <Link
            href="/notice"
            className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            공지사항 보기
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">시험 신청</h2>
          {user?.role === 'admin' && (
            <div className="mb-4">
              <button
                onClick={() => router.push('/exam/select')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 mb-2"
              >
                진급시험 선택
              </button>
            </div>
          )}
          {!session ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">시험 신청을 위해서는 로그인이 필요합니다.</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                로그인하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}
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
                  <option value="순경-경장">순경 → 경장 진급시험</option>
                  <option value="경장-경사">경장 → 경사 진급시험</option>
                  <option value="경사-경위">경사 → 경위 진급시험</option>
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                시험 신청하기
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">시험 응시 안내</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>시험 응시를 위해서는 회원가입 후 관리자 승인이 필요합니다.</li>
          <li>시험은 정해진 시간 내에 완료해야 합니다.</li>
          <li>결과는 시험 종료 후 즉시 확인하실 수 있습니다.</li>
          <li>문의사항은 공지사항을 참고해 주시기 바랍니다.</li>
        </ul>
      </div>
    </div>
  );
}
