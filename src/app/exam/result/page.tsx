'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExamResult {
  examId: string;
  answers: Array<{
    questionNumber: number;
    answer: string;
    score: number;
    maxPoints: number;
  }>;
  totalScore: number;
  submittedAt: string;
  gradedAt?: string;
}

export default function ExamResultPage() {
  const router = useRouter();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/exam/results');
      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('시험 결과를 불러오는데 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">시험 결과</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                총점: {result.totalScore}점
              </h2>
              <div className="text-sm text-gray-600">
                제출일: {new Date(result.submittedAt).toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              {result.answers.map((answer) => (
                <div key={answer.questionNumber} className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">문제 {answer.questionNumber}</h3>
                    <span className="text-sm">
                      {answer.score} / {answer.maxPoints}점
                    </span>
                  </div>
                  <p className="text-gray-600">제출한 답안: {answer.answer}</p>
                </div>
              ))}
            </div>

            {result.gradedAt ? (
              <div className="mt-4 text-sm text-gray-600">
                채점 완료: {new Date(result.gradedAt).toLocaleString()}
              </div>
            ) : (
              <div className="mt-4 text-sm text-yellow-600">
                서술형 문항 채점 대기 중
              </div>
            )}
          </div>
        ))}

        {results.length === 0 && !error && (
          <div className="text-center text-gray-600">
            시험 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
} 