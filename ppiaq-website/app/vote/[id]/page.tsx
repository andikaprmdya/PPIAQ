'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, LockKeyhole, Mail, Vote } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { BallotView } from '@/lib/elections/types';
import { formatElectionDate } from '@/lib/elections/rules';
import { buttonClass, cardClass, inputClass, secondaryClass } from '@/components/elections/ui';

export default function BallotPage() {
  const { id: electionId } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const id = language === 'id';
  const [token, setToken] = useState('');
  const [ballot, setBallot] = useState<BallotView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);

  const checkAccess = useCallback(async (secret: string, signal?: AbortSignal) => {
    const response = await fetch(`/api/vote/${electionId}`, {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'access', token: secret }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Could not open ballot');
    setBallot(body.data); setError('');
    if (body.data.hasVoted) {
      sessionStorage.removeItem(`ppiaq-vote:${electionId}`);
      setToken('');
    }
  }, [electionId]);

  useEffect(() => {
    const controller = new AbortController();
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const secret = fragment.get('token') || sessionStorage.getItem(`ppiaq-vote:${electionId}`) || '';
    // The token stays out of request URLs, browser history and referrers.
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    if (!/^[A-Za-z0-9_-]{43}$/.test(secret)) { setLoading(false); return; }
    sessionStorage.setItem(`ppiaq-vote:${electionId}`, secret);
    setToken(secret);
    checkAccess(secret, controller.signal)
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [checkAccess, electionId]);

  useEffect(() => {
    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  async function submit() {
    if (!selected || !token || busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/vote/${electionId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', token, candidateId: selected === 'ABSTAIN' ? null : selected }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not submit vote');
      setBallot(current => current ? { ...current, hasVoted: true } : current);
      sessionStorage.removeItem(`ppiaq-vote:${electionId}`);
      setToken(''); setSelected(''); setConfirming(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error. Check your voting status before trying again.');
      setConfirming(false);
    } finally { setBusy(false); }
  }

  const election = ballot?.election;
  const isOpen = !!election && election.status === 'PUBLISHED' && !!election.opensAt && !!election.closesAt &&
    now >= new Date(election.opensAt).getTime() && now < new Date(election.closesAt).getTime();
  const waiting = !!election?.opensAt && election.status === 'PUBLISHED' && now < new Date(election.opensAt).getTime();
  const selectedName = selected === 'ABSTAIN' ? 'Abstain' : election?.candidates.find(candidate => candidate.id === selected)?.name;

  return <div className="min-h-[70vh] bg-[#FFFAF5] px-4 py-10 text-[#303030] sm:py-16">
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#B64847]"><Vote size={23} />PPIAQ · {id ? 'Pemilihan Presiden' : 'Presidential Election'}</div>
      {loading ? <div className={cardClass}><p role="status">{id ? 'Membuka undangan pribadi…' : 'Opening your personal invitation…'}</p></div> : ballot?.hasVoted ?
        <section className={`${cardClass} py-12 text-center`}>
          <CheckCircle2 className="mx-auto text-emerald-700" size={56} />
          <h1 className="mt-5 font-tan-angleton text-3xl text-[#B64847]">{id ? 'Terima kasih. Suara Anda tercatat.' : 'Thank you. Your vote is recorded.'}</h1>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed">{id ? 'Anda sudah menggunakan hak pilih untuk pemilihan ini. Tautan yang sama tidak dapat dipakai untuk mengirim suara lagi.' : 'You have used your vote for this election. This invitation cannot submit another ballot.'}</p>
          <p className="mt-5 text-sm text-[#6b5a47]">{election?.title}</p>
          <p className="mt-3 text-sm text-[#6b5a47]">{id ? 'Pilihan Anda tidak ditampilkan dalam tanda terima ini.' : 'Your selection is not included in this confirmation.'}</p>
        </section> : !election ? <section className={`${cardClass} space-y-4`}>
          <Mail className="text-[#B64847]" size={40} /><h1 className="font-tan-angleton text-3xl text-[#B64847]">{id ? 'Buka undangan pribadi Anda' : 'Open your personal invitation'}</h1>
          <p>{id ? 'Gunakan tautan dari email pemilihan PPIAQ. ID anggota saja tidak bisa digunakan untuk memilih. Periksa Inbox, Spam, dan Promotions.' : 'Use the link in your PPIAQ election email. A membership ID alone cannot open a ballot. Check Inbox, Spam and Promotions.'}</p>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
          {token && <button className={secondaryClass} onClick={() => { setLoading(true); checkAccess(token).catch(error => setError(error.message)).finally(() => setLoading(false)); }}>{id ? 'Coba buka kembali' : 'Try opening again'}</button>}
          <p className="text-sm">{id ? 'Perlu bantuan? ' : 'Need help? '}<a className="text-[#B64847] underline" href="mailto:qld@ppi-australia.org">qld@ppi-australia.org</a></p>
        </section> : <>
          <section className={`${cardClass} space-y-4`}>
            <h1 className="font-tan-angleton text-3xl leading-snug text-[#B64847]">{election.title}</h1>
            <p className="whitespace-pre-wrap leading-relaxed text-[#6b5a47]">{election.description}</p>
            <dl className="space-y-2 rounded-xl bg-[#FFFAF5] p-4 text-sm">
              <div><dt className="inline font-bold">Voter ID: </dt><dd className="inline font-mono">{ballot.voterId}</dd></div>
              <div><dt className="inline font-bold">{id ? 'Buka: ' : 'Opens: '}</dt><dd className="inline">{formatElectionDate(election.opensAt)}</dd></div>
              <div><dt className="inline font-bold">{id ? 'Tutup: ' : 'Closes: '}</dt><dd className="inline">{formatElectionDate(election.closesAt)}</dd></div>
            </dl>
            <div className="flex items-start gap-3 text-sm leading-relaxed text-[#6b5a47]"><LockKeyhole className="mt-1 shrink-0 text-[#B64847]" size={19} /><p>{id ? 'Satu undangan, satu suara. Admin aplikasi melihat status sudah memilih, tanpa pilihan individu. Simpan tautan ini untuk diri sendiri; siapa pun yang memilikinya dapat menggunakannya lebih dahulu.' : 'One invitation, one vote. Application administrators see participation without individual choices. Keep your link private; anyone who has it can use it first.'}</p></div>
          </section>
          {!isOpen ? <section className={cardClass}><h2 className="text-xl font-bold">{waiting ? (id ? 'Voting belum dibuka' : 'Voting has not opened') : election.status === 'CANCELLED' ? (id ? 'Pemilihan dibatalkan' : 'Election cancelled') : (id ? 'Voting sudah ditutup' : 'Voting is closed')}</h2><p className="mt-3 text-sm">{waiting ? (id ? 'Halaman ini akan mengaktifkan pilihan saat jadwal buka. Tidak perlu mengirim suara sekarang.' : 'This page enables choices at the opening time. You cannot submit a vote yet.') : (id ? 'Suara baru tidak dapat dikirim.' : 'New ballots cannot be submitted.')}</p></section> :
          <section className={`${cardClass} space-y-5`}>
            <h2 className="text-xl font-bold">{id ? 'Pilih satu kandidat' : 'Choose one candidate'}</h2>
            <fieldset className="space-y-4" disabled={busy}><legend className="sr-only">{id ? 'Pilihan suara' : 'Ballot choices'}</legend>
              {election.candidates.map(candidate => <label key={candidate.id} className={`flex cursor-pointer gap-4 rounded-xl border-2 p-5 ${selected === candidate.id ? 'border-[#B64847] bg-[#B64847]/5' : 'border-[#E4DBCA]'}`}>
                <input type="radio" name="candidate" value={candidate.id} checked={selected === candidate.id} className="mt-1 accent-[#B64847]" onChange={() => setSelected(candidate.id)} />
                <span><span className="block text-lg font-bold">{candidate.name}</span><span className="mt-2 block whitespace-pre-wrap text-sm leading-relaxed text-[#6b5a47]">{candidate.manifesto}</span></span>
              </label>)}
              {election.allowAbstain && <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-5 ${selected === 'ABSTAIN' ? 'border-[#B64847] bg-[#B64847]/5' : 'border-[#E4DBCA]'}`}>
                <input type="radio" name="candidate" className="mt-1 accent-[#B64847]" checked={selected === 'ABSTAIN'} onChange={() => setSelected('ABSTAIN')} /><span><span className="font-bold">Abstain</span><span className="mt-1 block text-sm text-[#6b5a47]">{id ? 'Menggunakan hak pilih tanpa memilih kandidat.' : 'Use your vote without selecting a candidate.'}</span></span>
              </label>}
            </fieldset>
            {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><button className="mt-2 underline" onClick={() => checkAccess(token).catch(error => setError(error.message))}>{id ? 'Periksa status suara saya' : 'Check my voting status'}</button></div>}
            <button className={`${buttonClass} w-full`} disabled={!selected || busy} onClick={() => setConfirming(true)}>{id ? 'Tinjau pilihan' : 'Review choice'}</button>
            <p className="text-center text-xs text-[#6b5a47]">{id ? 'Suara yang sudah dikirim tidak dapat diubah atau dihapus.' : 'A submitted vote cannot be changed or deleted.'}</p>
          </section>}
        </>}
      <a href="/guides/PPIAQ_Election_Voter_Guide.pdf" target="_blank" rel="noreferrer" className="inline-block text-sm font-bold text-[#B64847] underline">{id ? 'Unduh panduan pemilih (PDF)' : 'Download voter guide (PDF)'}</a>
    </div>
    {confirming && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="vote-confirm-title">
      <div className={`${cardClass} max-w-lg space-y-5 shadow-xl`}>
        <h2 id="vote-confirm-title" className="text-2xl font-bold">{id ? 'Kirim suara ini?' : 'Submit this vote?'}</h2>
        <p className={inputClass}>{selectedName}</p>
        <p className="text-sm leading-relaxed">{id ? 'Setelah dikirim, Anda tidak dapat mengganti pilihan atau memilih lagi. Pastikan pilihan Anda sudah benar.' : 'Once submitted, you cannot change your selection or vote again. Check your choice carefully.'}</p>
        <div className="flex flex-wrap gap-3"><button className={secondaryClass} disabled={busy} onClick={() => setConfirming(false)}>{id ? 'Kembali' : 'Go back'}</button><button className={buttonClass} disabled={busy || !isOpen} onClick={submit}>{busy ? (id ? 'Mengirim…' : 'Submitting…') : (id ? 'Ya, kirim suara' : 'Yes, submit vote')}</button></div>
      </div>
    </div>}
  </div>;
}
