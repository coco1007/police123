'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as User;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, user, router]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (status === 'loading') {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }

  const menuItems = [
    {
      title: '시험 관리',
      description: '시험 문제 추가, 수정, 삭제',
      href: '/admin/exams',
      icon: '📝'
    },
    {
      title: '사용자 관리',
      description: '사용자 목록 조회, 권한 관리',
      href: '/admin/users',
      icon: '👥'
    },
    {
      title: '통계',
      description: '시험 응시 현황, 사용자 활동 통계',
      href: '/admin/statistics',
      icon: '📊'
    },
    {
      title: '학습 자료 관리',
      description: '학습 자료 추가, 수정, 삭제',
      href: '/admin/resources',
      icon: '📚'
    },
    {
      title: '공지사항 관리',
      description: '공지사항 작성, 수정, 삭제',
      href: '/admin/notices',
      icon: '📢'
    },
    {
      title: '시스템 설정',
      description: '시스템 환경 설정, 백업 관리',
      href: '/admin/settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 