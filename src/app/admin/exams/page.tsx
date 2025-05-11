'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Question {
  questionNumber: number;
  questionType: 'OX' | '객관식' | '서술형';
  questionText: string;
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  points: number;
}

interface Exam {
  _id: string;
  title: string;
  password: string;
  questions: Question[];
  isActive: boolean;
}

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [newExam, setNewExam] = useState({
    title: '',
    password: '',
    questions: [] as Question[],
    isActive: true,
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionNumber: 1,
    questionType: 'OX',
    questionText: '',
    options: [],
    correctAnswer: '',
    points: 10,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchExams();
    }
  }, [status, session, router]);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/admin/exams');
      const data = await res.json();
      if (res.ok) {
        setExams(data);
      } else {
        setError('시험 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionAdd = () => {
    setNewExam({
      ...newExam,
      questions: [...newExam.questions, { ...currentQuestion }],
    });
    setCurrentQuestion({
      questionNumber: currentQuestion.questionNumber + 1,
      questionType: 'OX',
      questionText: '',
      options: [],
      correctAnswer: '',
      points: 10,
    });
  };

  const handleOptionChange = (index: number, value: string, isCorrect?: boolean) => {
    const newOptions = [...(currentQuestion.options || [])];
    if (isCorrect !== undefined) {
      newOptions[index] = { ...newOptions[index], isCorrect };
    } else {
      newOptions[index] = { ...newOptions[index], text: value };
    }
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExam),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('시험이 성공적으로 추가되었습니다.');
        setNewExam({
          title: '',
          password: '',
          questions: [],
          isActive: true,
        });
        setCurrentQuestion({
          questionNumber: 1,
          questionType: 'OX',
          questionText: '',
          options: [],
          correctAnswer: '',
          points: 10,
        });
        fetchExams();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('시험 추가 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (examId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (res.ok) {
        setExams(exams.map(exam => 
          exam._id === examId 
            ? { ...exam, isActive: !currentStatus }
            : exam
        ));
      }
    } catch (error) {
      setError('시험 상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">시험 관리</h1>
        <Link
          href="/admin"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          뒤로가기
        </Link>
      </div>

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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">새 시험 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시험 제목
            </label>
            <input
              type="text"
              value={newExam.title}
              onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="예: 순경 -> 경장"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시험 비밀번호
            </label>
            <input
              type="text"
              value={newExam.password}
              onChange={(e) => setNewExam({ ...newExam, password: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">문제 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문제 유형
                </label>
                <select
                  value={currentQuestion.questionType}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion,
                    questionType: e.target.value as 'OX' | '객관식' | '서술형',
                    options: e.target.value === '객관식' ? Array(4).fill({ text: '', isCorrect: false }) : [],
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="OX">O/X</option>
                  <option value="객관식">객관식</option>
                  <option value="서술형">서술형</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문제 내용
                </label>
                <textarea
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>

              {currentQuestion.questionType === '객관식' && (
                <div className="space-y-4">
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder={`보기 ${index + 1}`}
                        required
                      />
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correct"
                          checked={option.isCorrect}
                          onChange={() => {
                            const newOptions = currentQuestion.options?.map((opt, i) => ({
                              ...opt,
                              isCorrect: i === index
                            }));
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                          className="mr-2"
                        />
                        정답
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {(currentQuestion.questionType === 'OX' || currentQuestion.questionType === '서술형') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentQuestion.questionType === 'OX' ? '정답' : '채점 기준'}
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배점
                </label>
                <input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleQuestionAdd}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                문제 추가
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">추가된 문제 목록</h3>
            <div className="space-y-4">
              {newExam.questions.map((q, index) => (
                <div key={index} className="p-4 border rounded">
                  <p className="font-medium">문제 {q.questionNumber}. [{q.questionType}] ({q.points}점)</p>
                  <p className="mt-2">{q.questionText}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            시험 저장
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">시험 목록</h2>
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam._id} className="border-b pb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{exam.title}</h3>
                <span className={`px-2 py-1 rounded text-sm ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {exam.isActive ? '활성' : '비활성'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">문제 수: {exam.questions.length}개</p>
              <p className="text-sm text-gray-600">비밀번호: {exam.password}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleToggleActive(exam._id, exam.isActive)}
                  className={`px-3 py-1 rounded text-sm ${
                    exam.isActive
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {exam.isActive ? '비활성화' : '활성화'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 