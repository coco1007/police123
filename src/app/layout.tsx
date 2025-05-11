'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

function Navigation() {
  const { data: session } = useSession();
  const user = session?.user as User;

  return (
    <nav className="w-full bg-blue-800 text-white py-4 mb-8">
      <div className="container mx-auto flex gap-6 justify-center">
        <Link href="/" className="hover:underline">홈</Link>
        <Link href="/exam" className="hover:underline">진급시험</Link>
        <Link href="/result" className="hover:underline">결과확인</Link>
        <Link href="/notice" className="hover:underline">공지사항</Link>
        <Link href="/resources" className="hover:underline">자료실</Link>
        {!session ? (
          <>
            <Link href="/login" className="hover:underline">로그인</Link>
            <Link href="/register" className="hover:underline">회원가입</Link>
          </>
        ) : (
          <>
            <Link href="/mypage" className="hover:underline">마이페이지</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="hover:underline">관리자</Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
