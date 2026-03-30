'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  const { isCurator, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isCurator && !isAdmin) {
      router.push('/');
    }
  }, [isCurator, isAdmin, loading, router]);

  if (loading || (!isCurator && !isAdmin)) {
    return null;
  }

  const sidebarItems = [
    { label: 'Upcoming Events', href: '/curator/events' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFAF5]">
      <aside className="w-64 bg-white border-r border-[#E4DBCA] shadow-sm">
        <div className="p-6 border-b border-[#E4DBCA]">
          <h1 className="font-tan-angleton font-bold text-2xl text-[#B64847]">PPIAQ</h1>
          <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mt-1">Curator Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all
                ${pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-[#B64847] text-white shadow-lg'
                  : 'text-[#886644] hover:bg-[#FFFAF5] hover:text-[#B64847]'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-xs uppercase"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-[#E4DBCA] shadow-sm p-6">
          <div className="max-w-7xl">
            <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mb-1">Curator Panel</p>
            <h2 className="font-tan-angleton font-bold text-2xl text-[#B64847]">
              {pathname.startsWith('/curator/events') && 'Upcoming Events Management'}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
