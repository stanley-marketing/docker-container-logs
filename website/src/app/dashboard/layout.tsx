"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../../lib/utils';

const tabs = [
  { key: 'summaries', label: 'Summaries', href: '/dashboard/summaries' },
  { key: 'search', label: 'Search', href: '/dashboard/search' },
  { key: 'ask', label: 'Ask', href: '/dashboard/ask' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Simple JWT presence check – full verification handled by API
  useEffect(() => {
    const token = localStorage.getItem('dlm_token');
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [router]);

  const active = tabs.find(t => pathname.startsWith(t.href))?.key ?? 'summaries';

  const handleLogout = () => {
    localStorage.removeItem('dlm_token');
    router.replace('/login');
  };

  return (
    <div className="p-6 md:p-10 max-w-screen-xl mx-auto">
      {/* top bar */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Docker Log Monitor</h1>
        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-800 underline">
          Logout
        </button>
      </header>

      {/* nav bar */}
      <nav className="mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              'px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors',
              active === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
} 