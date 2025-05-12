'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">My App</h1>
      </nav>
    </header>
  );
} 