'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { formatElectionDate } from '@/lib/elections/rules';
import { buttonClass, cardClass, ElectionBadge, secondaryClass } from '@/components/elections/ui';

type Summary = { id: string; title: string; status: string; opensAt: string | null; closesAt: string | null; _count: { voters: number; ballots: number; candidates: number } };

export default function ElectionsPage() {
  const { language } = useLanguage();
  const id = language === 'id';
  const router = useRouter();
  const [elections, setElections] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/elections', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setElections(body.data); setError('');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not load elections'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function create() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/elections', { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      router.push(`/admin/elections/${body.data.id}`);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not create draft'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6 text-[#303030]">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#886644]">PPIAQ · {id ? 'Pemilihan' : 'Elections'}</p>
        <h1 className="font-tan-angleton text-3xl text-[#B64847]">{id ? 'Satu anggota, satu suara' : 'One member, one vote'}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6b5a47]">{id ? 'Siapkan draft, tandai anggota finansial, lalu kirim undangan pribadi saat publish. Pilihan suara terpisah dari daftar pemilih.' : 'Prepare a draft, tag financial members, then publish to send personal invitations. Ballot choices are separate from the voter register.'}</p>
      </div>
      <button className={buttonClass} disabled={busy} onClick={create}>{busy ? '…' : id ? '+ Buat draft' : '+ Create draft'}</button>
    </div>
    <div className={`${cardClass} flex flex-wrap gap-3 items-center text-sm`}>
      <span className="font-bold">{id ? 'Panduan PDF' : 'PDF guides'}</span>
      <a className={secondaryClass} href="/guides/PPIAQ_Election_Admin_Guide.pdf" target="_blank" rel="noreferrer">Admin ↗</a>
      <a className={secondaryClass} href="/guides/PPIAQ_Election_Voter_Guide.pdf" target="_blank" rel="noreferrer">{id ? 'Pemilih' : 'Voters'} ↗</a>
      <button className="ml-auto text-[#B64847] underline" onClick={load}>{id ? 'Muat ulang' : 'Refresh'}</button>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {loading ? <p>{id ? 'Memuat…' : 'Loading…'}</p> : elections.length === 0 ?
      <div className={cardClass}><p>{id ? 'Belum ada pemilihan. Buat draft pertama untuk mulai.' : 'No elections yet. Create a draft to begin.'}</p></div> :
      <div className="grid gap-5 xl:grid-cols-2">{elections.map(election => <Link key={election.id} href={`/admin/elections/${election.id}`} className={`${cardClass} block transition-shadow hover:shadow-md`}>
        <ElectionBadge status={election.status} /><h2 className="mt-4 text-xl font-bold">{election.title}</h2>
        <p className="mt-3 text-sm text-[#6b5a47]">{id ? 'Buka' : 'Opens'}: {formatElectionDate(election.opensAt)}</p>
        <p className="mt-1 text-sm text-[#6b5a47]">{id ? 'Tutup' : 'Closes'}: {formatElectionDate(election.closesAt)}</p>
        <div className="mt-5 flex flex-wrap gap-4 border-t border-[#E4DBCA] pt-4 text-sm">
          <span>{election._count.candidates} {id ? 'kandidat' : 'candidates'}</span><span>{election._count.voters} {id ? 'pemilih' : 'voters'}</span><span>{election._count.ballots} {id ? 'suara masuk' : 'ballots'}</span>
        </div>
      </Link>)}</div>}
  </div>;
}
