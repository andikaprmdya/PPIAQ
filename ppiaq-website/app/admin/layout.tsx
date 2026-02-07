'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return null;
  }

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Events', href: '/admin/events', icon: '📅' },
    { label: 'Team', href: '/admin/team', icon: '👥' },
    { label: 'Content', href: '/admin/content', icon: '📝' },
    { label: 'FAQ', href: '/admin/faq', icon: '❓' },
    { label: 'Images', href: '/admin/images', icon: '🖼️' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFAF5]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E4DBCA] shadow-sm">
        <div className="p-6 border-b border-[#E4DBCA]">
          <h1 className="font-tan-angleton font-bold text-2xl text-[#B64847]">PPIAQ</h1>
          <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => (
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
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/"
            className="block w-full px-4 py-2 text-center border-2 border-[#B64847] text-[#B64847] font-bold rounded-xl hover:bg-[#B64847] hover:text-white transition-all text-xs uppercase"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E4DBCA] shadow-sm p-6">
          <div className="max-w-7xl">
            <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mb-1">Admin Panel</p>
            <h2 className="font-tan-angleton font-bold text-2xl text-[#B64847]">
              {pathname === '/admin/dashboard' && 'Dashboard'}
              {pathname.startsWith('/admin/events') && 'Events Management'}
              {pathname.startsWith('/admin/team') && 'Team Management'}
              {pathname.startsWith('/admin/content') && 'Content Management'}
              {pathname.startsWith('/admin/faq') && 'FAQ Management'}
              {pathname.startsWith('/admin/images') && 'Image Library'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
