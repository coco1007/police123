'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  name: string;
  rank: string;
  role: string;
  approved: boolean;
  createdAt: string;
  canSelectExam: boolean;
  approvalCode?: string;
}

interface ExamApplication {
  _id: string;
  userId: string;
  examType: string;
  examDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  viewed: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    rank: string;
  };
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [approvalCodes, setApprovalCodes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('사용자 목록을 불러오는데 실패했습니다.');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError('사용자 목록을 불러오는데 실패했습니다.');
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/admin/exam-applications');
        if (!response.ok) throw new Error('시험 신청 목록을 불러오는데 실패했습니다.');
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        setError('시험 신청 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchUsers();
      fetchApplications();
    }
  }, [session]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('역할 변경에 실패했습니다.');

      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      setSuccess('역할이 변경되었습니다.');
    } catch (error) {
      setError('역할 변경에 실패했습니다.');
    }
  };

  const handleExamPermissionChange = async (userId: string, canSelectExam: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canSelectExam }),
      });

      if (!response.ok) throw new Error('시험 선택 권한 변경에 실패했습니다.');

      setUsers(users.map(user => 
        user._id === userId ? { ...user, canSelectExam } : user
      ));
      setSuccess('시험 선택 권한이 변경되었습니다.');
    } catch (error) {
      setError('시험 선택 권한 변경에 실패했습니다.');
    }
  };

  const handleApplicationStatusChange = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/exam-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, viewed: true }),
      });

      if (!response.ok) throw new Error('신청 상태 변경에 실패했습니다.');

      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status, viewed: true } : app
      ));
      setSuccess('신청 상태가 변경되었습니다.');
    } catch (error) {
      setError('신청 상태 변경에 실패했습니다.');
    }
  };

  const handleViewApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/exam-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewed: true }),
      });

      if (!response.ok) throw new Error('신청 상태 업데이트에 실패했습니다.');

      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, viewed: true } : app
      ));
    } catch (error) {
      setError('신청 상태 업데이트에 실패했습니다.');
    }
  };

  const generateApprovalCode = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approval-code`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('승인코드 생성에 실패했습니다.');
      const data = await response.json();
      
      setApprovalCodes(prev => ({
        ...prev,
        [userId]: data.code
      }));
      setSuccess('승인코드가 생성되었습니다.');
    } catch (error) {
      setError('승인코드 생성에 실패했습니다.');
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <Link
          href="/admin"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          뒤로가기
        </Link>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">회원가입 승인코드 관리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user._id} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{user.name}</span>
                  <button
                    onClick={() => generateApprovalCode(user._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    승인코드 생성
                  </button>
                </div>
                {approvalCodes[user._id] && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">승인코드:</p>
                    <p className="font-mono bg-gray-100 p-2 rounded">{approvalCodes[user._id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                진급시험 선택
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                시험 신청 상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const userApplications = applications.filter(app => app.userId === user._id);
              return (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">일반 사용자</option>
                      <option value="admin">관리자</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleExamPermissionChange(user._id, !user.canSelectExam)}
                      className={`px-3 py-1 rounded ${
                        user.canSelectExam
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {user.canSelectExam ? '허용됨' : '비허용'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {userApplications.length > 0 ? (
                      <div className="space-y-2">
                        {userApplications.map(app => (
                          <div key={app._id} className="text-sm border rounded p-2">
                            <div className="font-medium">시험: {app.examType}</div>
                            <div>날짜: {new Date(app.examDate).toLocaleDateString()}</div>
                            <div>신청일: {new Date(app.createdAt).toLocaleDateString()}</div>
                            <div className={`font-medium ${
                              app.viewed ? 'text-gray-500' :
                              app.status === 'pending' ? 'text-yellow-600' :
                              app.status === 'approved' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              상태: {
                                app.viewed ? '만료' :
                                app.status === 'pending' ? '대기중' :
                                app.status === 'approved' ? '승인됨' : '거절됨'
                              }
                            </div>
                            {app.status === 'pending' && !app.viewed && (
                              <div className="mt-2 space-x-2">
                                <button
                                  onClick={() => {
                                    handleApplicationStatusChange(app._id, 'approved');
                                    handleViewApplication(app._id);
                                  }}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => {
                                    handleApplicationStatusChange(app._id, 'rejected');
                                    handleViewApplication(app._id);
                                  }}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                >
                                  거절
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">신청 없음</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {user.role === 'admin' ? '일반 사용자로 변경' : '관리자로 변경'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 