'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  questionNumber: number;
  questionType: 'OX' | '객관식' | '서술형';
  questionText: string;
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  points: number;
}

interface Exam {
  _id: string;
  title: string;
  questions: Question[];
}

export default function TakeExamPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exam/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setExam(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('시험 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionNumber]: answer,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: exam._id,
          answers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('시험이 제출되었습니다.');
        router.push('/exam/result');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('시험 제출 중 오류가 발생했습니다.');
    }
  };

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8">진급 시험</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시험 비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                시험 시작
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{exam.title}</h1>

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {exam.questions.map((question) => (
          <div key={question.questionNumber} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">
                문제 {question.questionNumber}. [{question.questionType}] ({question.points}점)
              </h3>
            </div>
            
            <p className="mb-4">{question.questionText}</p>

            {question.questionType === 'OX' && (
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.questionNumber}`}
                    value="O"
                    onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                    className="mr-2"
                    required
                  />
                  O
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.questionNumber}`}
                    value="X"
                    onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                    className="mr-2"
                    required
                  />
                  X
                </label>
              </div>
            )}

            {question.questionType === '객관식' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="block">
                    <input
                      type="radio"
                      name={`question-${question.questionNumber}`}
                      value={index + 1}
                      onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                      className="mr-2"
                      required
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            )}

            {question.questionType === '서술형' && (
              <textarea
                value={answers[question.questionNumber] || ''}
                onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                required
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          시험 제출
        </button>
      </form>
    </div>
  );
} 