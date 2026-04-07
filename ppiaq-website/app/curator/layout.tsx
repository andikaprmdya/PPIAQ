'use client';

import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { getTranslation, translations } from '@/lib/translations';

export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  const { isCurator, isAdmin, loading } = useAuth();
  const { language } = useLanguage();
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
    { label: getTranslation(translations.curator.layout.upcomingEvents, language), href: '/curator/events' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[#E4DBCA] bg-white shadow-sm lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="border-b border-[#E4DBCA] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-4">
              <Image
                src="/images/PPIAQ_Logofornavbar.png"
                alt="PPIA Queensland"
                width={164}
                height={44}
                className="h-auto w-[140px] sm:w-[164px]"
                priority
              />
              <div className="min-w-0">
                <p className="font-tan-angleton text-lg font-bold text-[#303030] sm:text-xl">
                  {getTranslation(translations.curator.layout.dashboard, language)}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#886644]">
                  {getTranslation(translations.curator.layout.upcomingEvents, language)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6">
            <div className="rounded-[28px] border border-[#E4DBCA] bg-[#FFFAF5] p-5 shadow-[0_16px_35px_rgba(48,48,48,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#886644]">
                {getTranslation(translations.curator.layout.loggedInAs, language)}
              </p>
              <p className="mt-3 font-tan-angleton text-2xl font-bold text-[#B64847]">
                {getTranslation(translations.curator.layout.curator, language)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#886644]">
                {getTranslation(translations.curator.layout.summary, language)}
              </p>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] transition-all
                    ${pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-[#B64847] text-white shadow-[0_14px_30px_rgba(182,72,71,0.26)]'
                      : 'border border-[#E4DBCA] bg-white text-[#886644] hover:border-[#B64847] hover:text-[#B64847]'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="rounded-[28px] border border-[#E4DBCA] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#886644]">
                {getTranslation(translations.curator.layout.quickNotes, language)}
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#886644]">
                <li>{getTranslation(translations.curator.layout.note1, language)}</li>
                <li>{getTranslation(translations.curator.layout.note2, language)}</li>
                <li>{getTranslation(translations.curator.layout.note3, language)}</li>
              </ul>
            </div>

            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-[#B64847] px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#B64847] transition-all hover:bg-[#B64847] hover:text-white"
            >
              {getTranslation(translations.curator.layout.backToSite, language)}
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#E4DBCA] bg-white/90 px-5 py-6 shadow-sm backdrop-blur sm:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#886644]">
                {getTranslation(translations.curator.layout.panel, language)}
              </p>
              <h2 className="font-tan-angleton text-3xl font-bold text-[#B64847] sm:text-4xl">
                {pathname.startsWith('/curator/events') && getTranslation(translations.curator.layout.upcomingEventsManagement, language)}
              </h2>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
