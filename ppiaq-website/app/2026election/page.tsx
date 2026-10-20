import type { Metadata } from 'next';
import ElectionForm from '@/components/elections/ElectionForm';

export const metadata: Metadata = {
  title: '2026 Election | PPIA Queensland',
  description: 'Access the PPIAQ 2026 election form.',
  alternates: { canonical: '/2026election' },
  openGraph: {
    title: '2026 Election | PPIA Queensland',
    description: 'Access the PPIAQ 2026 election form.',
    url: '/2026election',
  },
};

export default function ElectionPage() {
  return <ElectionForm />;
}
