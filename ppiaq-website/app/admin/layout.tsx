'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const { language } = useLanguage();
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

  const sidebarItems: Array<{ label: string; href: string; highlight?: boolean }> = [
    { label: getTranslation(translations.admin.layout.dashboard, language), href: '/admin/dashboard' },
    { label: getTranslation(translations.admin.layout.events, language), href: '/admin/events' },
    { label: getTranslation(translations.admin.layout.team, language), href: '/admin/team' },
    { label: getTranslation(translations.admin.layout.communityBoard, language), href: '/admin/community-board' },
    {
      label: language === 'id' ? 'Sponsor Pesra' : 'Pesra Sponsors',
      href: '/admin/content/pesta-rakyat',
      highlight: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFAF5]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E4DBCA] shadow-sm">
        <div className="p-6 border-b border-[#E4DBCA]">
          <h1 className="font-tan-angleton font-bold text-2xl text-[#B64847]">PPIAQ</h1>
          <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mt-1">
            {getTranslation(translations.admin.layout.panel, language)}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all border
                ${pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-[#B64847] text-white shadow-lg border-[#B64847]'
                  : item.highlight
                    ? 'bg-[#FEB602]/20 border-[#FEB602] text-[#B64847] hover:bg-[#FEB602] hover:text-[#303030]'
                    : 'border-transparent text-[#886644] hover:bg-[#FFFAF5] hover:text-[#B64847]'
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
            ← {getTranslation(translations.common.backToSite, language)}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E4DBCA] shadow-sm p-6">
          <div className="max-w-7xl">
            <p className="text-xs text-[#886644] font-bold uppercase tracking-widest mb-1">
              {getTranslation(translations.admin.layout.panel, language)}
            </p>
            <h2 className="font-tan-angleton font-bold text-2xl text-[#B64847]">
              {pathname === '/admin/dashboard' && getTranslation(translations.admin.layout.dashboard, language)}
              {pathname.startsWith('/admin/events') && getTranslation(translations.admin.layout.eventsManagement, language)}
              {pathname.startsWith('/admin/team') && getTranslation(translations.admin.layout.teamManagement, language)}
              {pathname.startsWith('/admin/community-board') && getTranslation(translations.admin.layout.communityBoardManagement, language)}
              {pathname.startsWith('/admin/content/pesta-rakyat') && (language === 'id' ? 'Sponsor Pesra' : 'Pesra Sponsors')}
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
