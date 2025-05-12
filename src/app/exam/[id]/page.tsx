'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Exam {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: {
    _id: string;
    type: string;
    text: string;
    points: number;
    options?: string[];
  }[];
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchExam();
  }, []);

  useEffect(() => {
    if (exam && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exam, timeLeft]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${params.id}`);
      if (!response.ok) {
        throw new Error('시험 정보를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      if (!data.questions) {
        throw new Error('시험 문제를 불러오는데 실패했습니다.');
      }
      setExam(data);
      // 20분으로 고정
      setTimeLeft(20 * 60);
      // 각 문제의 답변 필드 초기화
      const initialAnswers = data.questions.reduce((acc: { [key: string]: string }, q: any) => {
        acc[q._id] = '';
        return acc;
      }, {});
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('시험 정보를 불러오는데 실패했습니다.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!studentId || !studentName) {
      toast.error('학번과 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/exams/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          studentId,
          studentName,
          answers 
        }),
      });

      if (!response.ok) {
        throw new Error('답안 제출에 실패했습니다.');
      }

      toast.success('답안이 제출되었습니다.');
      router.push('/');
    } catch (error) {
      toast.error('답안 제출 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!exam || !exam.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">시험을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black">{exam.title}</h1>
          <div className="text-lg font-semibold text-black">
            남은 시간: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <p className="text-gray-600 mb-8">{exam.description}</p>

        <div className="mb-8 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">학번</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="학번을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {exam.questions.map((question, index) => (
            <div key={index} className="border rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-black">
                  {index + 1}. {question.text}
                </h3>
                <span className="text-sm text-gray-600">{question.points}점</span>
              </div>

              {question.type === 'ox' && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="true"
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      className="form-radio"
                    />
                    <span className="text-black">O</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value="false"
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      className="form-radio"
                    />
                    <span className="text-black">X</span>
                  </label>
                </div>
              )}

              {question.type === 'multiple' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        className="form-radio"
                      />
                      <span className="text-black">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'essay' && (
                <textarea
                  value={answers[question._id] || ''}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  className="w-full h-32 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  placeholder="답변을 입력하세요"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
} 