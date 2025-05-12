'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Answer {
  questionId: string;
  answer: string;
}

interface Question {
  _id: string;
  type: 'ox' | 'multiple' | 'essay';
  text: string;
  options?: string[];
}

interface Submission {
  _id: string;
  exam: {
    _id: string;
    title: string;
    questions: Question[];
  };
  studentId: string;
  studentName: string;
  answers: Answer[];
  submittedAt: string;
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubmission();
  }, [params.id]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/admin/submissions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmission(data);
      } else {
        toast.error('제출물을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      toast.error('제출물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnswerText = (question: Question, answer: Answer) => {
    if (question.type === 'ox') {
      return answer.answer === 'true' ? 'O' : 'X';
    }
    if (question.type === 'multiple' && question.options) {
      const optionIndex = parseInt(answer.answer);
      return question.options[optionIndex];
    }
    return answer.answer;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">제출물을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">시험 제출물 상세</h1>
          <button
            onClick={() => router.push('/admin/submissions')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            목록으로
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">시험 정보</h2>
              <p>시험명: {submission.exam.title}</p>
              <p>제출일시: {formatDate(submission.submittedAt)}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">응시자 정보</h2>
              <p>고유번호: {submission.studentId}</p>
              <p>이름: {submission.studentName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">답변 목록</h2>
          <div className="space-y-6">
            {submission.exam.questions.map((question, index) => {
              const answer = submission.answers.find(a => a.questionId === question._id);
              return (
                <div key={question._id} className="border-b pb-4">
                  <div className="mb-2">
                    <span className="font-semibold">문제 {index + 1}.</span>
                    <span className="ml-2">{question.text}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600">
                      답변: {answer ? getAnswerText(question, answer) : '답변 없음'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 