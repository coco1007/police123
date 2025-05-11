'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  category: string;
  difficulty: string;
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: '',
    category: '형법',
    difficulty: '중'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['형법', '형사소송법', '행정법', '경찰행정법', '경찰실무'];
  const difficulties = ['상', '중', '하'];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions');
      const data = await res.json();
      if (res.ok) {
        setQuestions(data);
      } else {
        setError('문제 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    }
  };

  const handleOptionChange = (index: number, value: string, isCorrect?: boolean) => {
    const newOptions = [...newQuestion.options];
    if (isCorrect !== undefined) {
      newOptions[index] = { ...newOptions[index], isCorrect };
    } else {
      newOptions[index] = { ...newOptions[index], text: value };
    }
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('문제가 성공적으로 추가되었습니다.');
        setNewQuestion({
          questionText: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          explanation: '',
          category: '형법',
          difficulty: '중'
        });
        fetchQuestions();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('문제 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">시험 문제 관리</h1>

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

      {/* 새 문제 추가 폼 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">새 문제 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 내용
            </label>
            <textarea
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              보기
            </label>
            {newQuestion.options.map((option, index) => (
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
                      const newOptions = newQuestion.options.map((opt, i) => ({
                        ...opt,
                        isCorrect: i === index
                      }));
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                    className="mr-2"
                    required
                  />
                  정답
                </label>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              해설
            </label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                과목
              </label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                난이도
              </label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            문제 추가
          </button>
        </form>
      </div>

      {/* 문제 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">문제 목록</h2>
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="border-b pb-4">
              <h3 className="font-medium">{question.questionText}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>과목: {question.category}</p>
                <p>난이도: {question.difficulty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 