'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return null;
  }

  const mainNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Events', href: '/admin/events' },
    { label: 'Team', href: '/admin/team' },
  ];

  const contentMenuItems = [
    { label: 'Home', href: '/admin/content/home' },
    { label: 'About', href: '/admin/content/about' },
    { label: 'Membership', href: '/admin/content/membership' },
    { label: 'Pesta Rakyat', href: '/admin/content/pesta-rakyat' },
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
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => (
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

          {/* Content Dropdown */}
          <div className="relative">
            <button
              onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
              className={`
                w-full text-left px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-between
                ${pathname.startsWith('/admin/content')
                  ? 'bg-[#B64847] text-white shadow-lg'
                  : 'text-[#886644] hover:bg-[#FFFAF5] hover:text-[#B64847]'
                }
              `}
            >
              Content
              <span className={`transition-transform ${contentDropdownOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {contentDropdownOpen && (
              <div className="mt-1 bg-white border border-[#E4DBCA] rounded-xl shadow-lg overflow-hidden">
                {contentMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setContentDropdownOpen(false)}
                    className={`
                      block w-full text-left px-6 py-2.5 text-xs uppercase tracking-widest font-bold transition-all border-l-4
                      ${pathname === item.href
                        ? 'bg-[#FFFAF5] text-[#B64847] border-l-[#B64847]'
                        : 'text-[#886644] border-l-transparent hover:bg-[#FFFAF5] hover:text-[#B64847]'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
              {pathname === '/admin/content/home' && 'Home Page Content'}
              {pathname === '/admin/content/about' && 'About Page Content'}
              {pathname === '/admin/content/membership' && 'Membership Page Content'}
              {pathname === '/admin/content/pesta-rakyat' && 'Pesta Rakyat Page Content'}
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
