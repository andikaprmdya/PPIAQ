import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Surat Suara Pribadi | PPIAQ',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  alternates: { canonical: null },
};

export default function VoteLayout({ children }: { children: React.ReactNode }) { return children; }
