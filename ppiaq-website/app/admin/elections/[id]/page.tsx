'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { DraftInput, formatElectionDate } from '@/lib/elections/rules';
import { ElectionMember, ElectionView } from '@/lib/elections/types';
import { buttonClass, cardClass, ElectionBadge, inputClass, secondaryClass } from '@/components/elections/ui';

const localDate = (value: string | null) => value ? new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).format(new Date(value)).replace(' ', 'T') : '';
const isoDate = (value: string) => value ? new Date(value + ':00+10:00').toISOString() : null;

function draftFrom(election: ElectionView): DraftInput {
  return { title: election.title, description: election.description, opensAt: election.opensAt, closesAt: election.closesAt,
    allowAbstain: election.allowAbstain, emailSubject: election.emailSubject, emailBody: election.emailBody,
    candidates: election.candidates.map(({ name, manifesto }) => ({ name, manifesto })),
    voterUserIds: election.voters.map(voter => voter.userId), revision: election.revision };
}

export default function ElectionEditor() {
  const { id: electionId } = useParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const id = language === 'id';
  const [election, setElection] = useState<ElectionView | null>(null);
  const [form, setForm] = useState<DraftInput | null>(null);
  const [members, setMembers] = useState<ElectionMember[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [financialConfirmed, setFinancialConfirmed] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  const refreshMembers = useCallback(async (at: string | null) => {
    const response = await fetch(`/api/admin/elections/members${at ? '?at=' + encodeURIComponent(at) : ''}`, { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error);
    setMembers(body.data);
  }, []);

  const load = useCallback(async () => {
    try {
      setError(''); setPage(0);
      const response = await fetch(`/api/admin/elections/${electionId}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setElection(body.data); setForm(draftFrom(body.data)); setDirty(false); setFinancialConfirmed(false);
      if (body.data.status === 'DRAFT') await refreshMembers(body.data.opensAt);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not load election'); }
  }, [electionId, refreshMembers]);
  useEffect(() => { void load(); }, [load]);

  function change<K extends keyof DraftInput>(key: K, value: DraftInput[K]) {
    setForm(current => current ? { ...current, [key]: value } : current);
    setDirty(true); setFinancialConfirmed(false); setPreview(null); setNotice('');
  }

  async function save() {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/elections/${electionId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setElection(body.data); setForm(draftFrom(body.data)); setDirty(false);
      setNotice(id ? 'Draft tersimpan. Belum ada email yang dikirim.' : 'Draft saved. No emails have been sent.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save'); }
    finally { setBusy(false); }
  }

  async function action(action: 'publish' | 'close' | 'cancel' | 'retry' | 'resend', voterId?: string) {
    if (!election) return;
    const prompt = action === 'publish'
      ? (id ? `Publish dan kirim ${election.voters.length} undangan pribadi? Kandidat dan daftar pemilih akan terkunci.` : `Publish and send ${election.voters.length} personal invitations? Candidates and the voter roll will be locked.`)
      : action === 'close' ? (id ? 'Tutup voting sekarang? Suara berikutnya akan ditolak dan hasil menjadi final.' : 'Close voting now? Further votes will be rejected and results become final.')
      : action === 'cancel' ? (id ? 'Batalkan pemilihan ini? Catatan yang sudah ada tetap disimpan.' : 'Cancel this election? Existing records will be preserved.')
      : action === 'resend' ? (id ? 'Kirim ulang undangan ke alamat anggota yang sama? Hak pilih tetap satu.' : 'Resend the invitation to the same member address? The member still has only one vote.') : '';
    if (prompt && !window.confirm(prompt)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/elections/${electionId}/actions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, revision: election.revision, financialConfirmed, ...(voterId ? { voterId } : {}) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      await load();
      setNotice(action === 'publish' || action === 'retry' || action === 'resend'
        ? (id ? 'Undangan sedang diproses di server. Klik Muat ulang untuk melihat status; tab ini boleh ditutup.' : 'Invitations are processing on the server. Refresh for status; you may close this tab.')
        : body.message);
    } catch (error) { setError(error instanceof Error ? error.message : 'Action failed'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!election || !window.confirm(id ? 'Hapus draft ini? Tidak ada email yang akan dikirim.' : 'Delete this draft? No emails will be sent.')) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/elections/${electionId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: election.revision }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      router.push('/admin/elections');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not delete draft'); setBusy(false); }
  }

  async function showPreview() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/elections/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setPreview(body);
    } catch (error) { setError(error instanceof Error ? error.message : 'Preview failed'); }
    finally { setBusy(false); }
  }

  if (!election || !form) return <div>{error ? <p role="alert" className="text-red-800">{error}</p> : <p>Loading…</p>}<Link href="/admin/elections" className="mt-4 block underline">← Elections</Link></div>;
  const draft = election.status === 'DRAFT';
  const selected = new Set(form.voterUserIds);
  const eligible = members.filter(member => member.eligible);
  const query = search.trim().toLowerCase();
  const filteredMembers = members.filter(member => `${member.firstName} ${member.lastName} ${member.email} ${member.memberNo || ''} ${member.university}`.toLowerCase().includes(query));
  const filteredVoters = election.voters.filter(voter => `${voter.name} ${voter.email} ${voter.voterId}`.toLowerCase().includes(query));
  const mailCounts = election.voters.reduce<Record<string, number>>((counts, voter) => {
    const status = voter.mailBatch?.status || 'NOT_QUEUED'; counts[status] = (counts[status] || 0) + 1; return counts;
  }, {});
  const live = election.status === 'PUBLISHED' && !!election.closesAt && new Date(election.closesAt).getTime() > Date.now();
  const pages = Math.ceil((draft ? filteredMembers.length : filteredVoters.length) / 25);

  return <div className="space-y-6 text-[#303030]">
    <Link href="/admin/elections" className="text-sm font-bold text-[#B64847]">← {id ? 'Semua pemilihan' : 'All elections'}</Link>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><ElectionBadge status={election.status} /><h1 className="mt-3 font-tan-angleton text-3xl text-[#B64847]">{election.title}</h1>
        <p className="mt-2 text-sm text-[#6b5a47]">{draft ? (id ? 'Simpan draft tidak mengirim email.' : 'Saving a draft does not send email.') : `${election._count.ballots} / ${election._count.voters} ${id ? 'anggota sudah memilih' : 'members have voted'}`}</p></div>
      <div className="flex flex-wrap gap-2"><button className={secondaryClass} disabled={busy} onClick={() => { if (!dirty || window.confirm(id ? 'Buang perubahan yang belum disimpan?' : 'Discard unsaved changes?')) void load(); }}>{id ? 'Muat ulang' : 'Refresh'}</button>
        {draft && <button className={buttonClass} disabled={busy} onClick={save}>{busy ? '…' : id ? 'Simpan draft' : 'Save draft'}</button>}</div>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">{notice}</p>}
    {dirty && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{id ? 'Ada perubahan yang belum disimpan. Simpan sebelum publish.' : 'You have unsaved changes. Save before publishing.'}</p>}

    <section className={`${cardClass} space-y-4`}>
      <h2 className="text-xl font-bold">1. {id ? 'Detail & jadwal' : 'Details & schedule'}</h2>
      <label className="block text-sm font-bold">{id ? 'Judul' : 'Title'}<input className={`${inputClass} mt-2`} value={form.title} maxLength={160} disabled={!draft || busy} onChange={event => change('title', event.target.value)} /></label>
      <label className="block text-sm font-bold">{id ? 'Pengantar untuk pemilih' : 'Introduction for voters'}<textarea className={`${inputClass} mt-2 font-normal`} rows={4} value={form.description} maxLength={8000} disabled={!draft || busy} onChange={event => change('description', event.target.value)} /></label>
      <p className="text-sm text-[#6b5a47]">{id ? 'Semua waktu memakai Brisbane / AEST (UTC+10).' : 'All times use Brisbane / AEST (UTC+10).'}</p>
      <div className="grid gap-4 md:grid-cols-2">{(['opensAt', 'closesAt'] as const).map(key => <label key={key} className="block text-sm font-bold">
        {key === 'opensAt' ? (id ? 'Voting dibuka' : 'Voting opens') : (id ? 'Voting ditutup' : 'Voting closes')}
        <input type="datetime-local" className={`${inputClass} mt-2`} value={localDate(form[key])} disabled={!draft || busy} onChange={event => change(key, isoDate(event.target.value))} />
      </label>)}</div>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.allowAbstain} disabled={!draft || busy} onChange={event => change('allowAbstain', event.target.checked)} />{id ? 'Sediakan pilihan abstain' : 'Allow an abstain option'}</label>
    </section>

    <section className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">2. {id ? 'Kandidat' : 'Candidates'}</h2>
        {draft && <button className={secondaryClass} disabled={busy || form.candidates.length >= 20} onClick={() => change('candidates', [...form.candidates, { name: '', manifesto: '' }])}>+ {id ? 'Tambah kandidat' : 'Add candidate'}</button>}</div>
      {form.candidates.length === 0 && <p className="text-sm text-[#6b5a47]">{id ? 'Tambahkan setidaknya dua kandidat sebelum publish.' : 'Add at least two candidates before publishing.'}</p>}
      {form.candidates.map((candidate, index) => <div key={index} className="space-y-3 rounded-xl border border-[#E4DBCA] bg-[#FFFAF5] p-4">
        <div className="flex items-center justify-between"><p className="text-sm font-bold">{id ? 'Kandidat' : 'Candidate'} {index + 1}</p>{draft && <button className="text-sm text-red-700 underline" disabled={busy} onClick={() => change('candidates', form.candidates.filter((_, item) => item !== index))}>{id ? 'Hapus kandidat' : 'Remove candidate'}</button>}</div>
        <label className="block text-sm">{id ? 'Nama' : 'Name'}<input className={`${inputClass} mt-1`} value={candidate.name} maxLength={120} disabled={!draft || busy} onChange={event => change('candidates', form.candidates.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label>
        <label className="block text-sm">{id ? 'Profil, visi & misi' : 'Profile & manifesto'}<textarea className={`${inputClass} mt-1`} rows={3} value={candidate.manifesto} maxLength={6000} disabled={!draft || busy} onChange={event => change('candidates', form.candidates.map((item, itemIndex) => itemIndex === index ? { ...item, manifesto: event.target.value } : item))} /></label>
      </div>)}
    </section>

    <section className={`${cardClass} space-y-4`}>
      <h2 className="text-xl font-bold">3. {id ? 'Tag anggota finansial' : 'Tag financial members'} <span className="text-base text-[#886644]">({draft ? selected.size : election.voters.length})</span></h2>
      <p className="text-sm leading-relaxed text-[#6b5a47]">{id ? 'Ordinary dan associate aktif boleh dipilih. Centang hanya anggota yang pembayaran iurannya sudah diverifikasi. Status APPROVED dan masa aktif tidak otomatis membuktikan pembayaran. Hak pilih dibekukan berdasarkan masa keanggotaan saat voting dibuka.' : 'Active ordinary and associate members can be tagged. Select only members whose fees you have verified. APPROVED status and an active term do not by themselves prove payment. Eligibility is frozen using membership at the voting opening time.'}</p>
      {draft && <div className="flex flex-wrap gap-2">
        <button className={secondaryClass} disabled={busy} onClick={() => { if (window.confirm(id ? 'Tandai semua anggota aktif setelah Anda memverifikasi pembayaran mereka?' : 'Tag all active members after verifying their payments?')) change('voterUserIds', eligible.map(member => member.id)); }}>{id ? 'Tag semua anggota aktif' : 'Tag all active members'} ({eligible.length})</button>
        <button className={secondaryClass} disabled={busy} onClick={() => change('voterUserIds', [])}>{id ? 'Hapus semua tag' : 'Clear tags'}</button>
        <button className={secondaryClass} disabled={busy} onClick={() => refreshMembers(form.opensAt).catch(error => setError(error.message))}>{id ? 'Periksa kelayakan pada jadwal buka' : 'Check eligibility at opening time'}</button>
      </div>}
      <label className="block text-sm">{id ? 'Cari nama, email, ID anggota atau kampus' : 'Search name, email, membership ID or university'}<input className={`${inputClass} mt-1`} value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} /></label>
      <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[#E4DBCA] text-[#886644]"><tr><th className="p-3">{draft ? 'Tag' : id ? 'Memilih' : 'Voted'}</th><th className="p-3">{id ? 'Anggota' : 'Member'}</th><th className="p-3">{id ? 'ID anggota / pemilih' : 'Member / voter ID'}</th><th className="p-3">{draft ? (id ? 'Kelayakan' : 'Eligibility') : 'Email'}</th></tr></thead>
        <tbody>{draft ? filteredMembers.slice(page * 25, page * 25 + 25).map(member => <tr key={member.id} className="border-b border-[#E4DBCA]/60">
          <td className="p-3"><input type="checkbox" aria-label={`Tag ${member.firstName} ${member.lastName}`} checked={selected.has(member.id)} disabled={busy || (!member.eligible && !selected.has(member.id))} onChange={event => change('voterUserIds', event.target.checked ? [...form.voterUserIds, member.id] : form.voterUserIds.filter(value => value !== member.id))} /></td>
          <td className="p-3"><p className="font-bold">{member.firstName} {member.lastName}</p><p className="break-all text-xs">{member.email}</p><p className="mt-1 text-xs text-[#886644]">{member.membershipType} · {member.university}</p></td>
          <td className="p-3">{member.memberNo || election.voters.find(voter => voter.userId === member.id)?.voterId || (id ? 'ID unik saat simpan' : 'Unique ID on save')}</td>
          <td className={`p-3 text-xs ${member.eligible ? 'text-emerald-800' : 'text-red-700'}`}>{member.reason}</td>
        </tr>) : filteredVoters.slice(page * 25, page * 25 + 25).map(voter => <tr key={voter.id} className="border-b border-[#E4DBCA]/60">
          <td className="p-3">{voter.hasVoted ? (id ? 'Sudah' : 'Yes') : (id ? 'Belum' : 'No')}</td><td className="p-3"><p className="font-bold">{voter.name}</p><p className="break-all text-xs">{voter.email}</p></td><td className="p-3 font-mono text-xs">{voter.voterId}</td>
          <td className="p-3 text-xs"><p>{voter.mailBatch?.status === 'SENT' ? (id ? 'Diterima layanan email' : 'Accepted by email service') : voter.mailBatch?.status || '—'}</p>{voter.mailBatch?.errorCode && <p className="mt-1 text-red-700">{voter.mailBatch.errorCode}</p>}{live && !voter.hasVoted && voter.mailBatch?.status === 'SENT' && <button className="mt-2 text-[#B64847] underline disabled:opacity-50" disabled={busy} onClick={() => action('resend', voter.id)}>{id ? 'Kirim ulang undangan' : 'Resend invitation'}</button>}</td>
        </tr>)}</tbody>
      </table></div>
      {pages > 1 && <div className="flex items-center justify-end gap-3 text-sm"><button className={secondaryClass} disabled={page === 0} onClick={() => setPage(page - 1)}>←</button><span>{page + 1} / {pages}</span><button className={secondaryClass} disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>→</button></div>}
    </section>

    <section className={`${cardClass} space-y-4`}>
      <h2 className="text-xl font-bold">4. {id ? 'Undangan email pribadi' : 'Personal email invitation'}</h2>
      <label className="block text-sm font-bold">{id ? 'Subjek' : 'Subject'}<input className={`${inputClass} mt-2`} maxLength={180} value={form.emailSubject} disabled={!draft || busy} onChange={event => change('emailSubject', event.target.value)} /></label>
      <label className="block text-sm font-bold">{id ? 'Isi email' : 'Email message'}<textarea className={`${inputClass} mt-2 font-normal`} rows={12} maxLength={12000} value={form.emailBody} disabled={!draft || busy} onChange={event => change('emailBody', event.target.value)} /></label>
      <p className="break-words text-xs leading-relaxed text-[#6b5a47]">{'{{firstName}} · {{electionTitle}} · {{voterId}} · {{votingLink}} · {{opensAt}} · {{closesAt}}'}</p>
      <button className={secondaryClass} disabled={busy} onClick={showPreview}>{id ? 'Pratinjau email — tidak mengirim' : 'Preview email — does not send'}</button>
      {preview && <div className="rounded-xl border border-[#E4DBCA] p-4"><p className="mb-3 text-sm font-bold">{preview.subject}</p><iframe title="Invitation email preview" sandbox="" srcDoc={preview.html} className="h-[600px] w-full rounded-xl bg-[#FFFAF5]" /></div>}
    </section>

    {draft ? <section className={`${cardClass} space-y-4 border-[#B64847]`}>
      <h2 className="text-xl font-bold">5. Publish</h2>
      <p className="text-sm leading-relaxed">{id ? 'Publish mengunci kandidat dan daftar pemilih, lalu otomatis mengirim email terpisah kepada semua anggota yang ditandai. Undangan berlaku sesuai jadwal. Menghapus draft tidak mengirim email.' : 'Publishing locks candidates and the voter roll, then automatically sends separate emails to every tagged member. Voting follows the schedule. Deleting a draft sends no emails.'}</p>
      <p className="text-sm">{election.voters.length} {id ? 'penerima tersimpan' : 'saved recipients'} · {election.candidates.length} {id ? 'kandidat' : 'candidates'}<br />{formatElectionDate(election.opensAt)} → {formatElectionDate(election.closesAt)}</p>
      <label className="flex items-start gap-3 rounded-xl bg-[#FFFAF5] p-4 text-sm"><input className="mt-1" type="checkbox" checked={financialConfirmed} disabled={dirty || busy} onChange={event => setFinancialConfirmed(event.target.checked)} />{id ? 'Saya sudah memverifikasi bahwa semua anggota yang ditandai telah membayar iuran, berhak memilih, dan tidak tercatat ganda.' : 'I verified that all tagged members have paid their fees, are eligible to vote, and are not duplicate people.'}</label>
      <div className="flex flex-wrap justify-between gap-3"><button className={buttonClass} disabled={busy || dirty || !financialConfirmed || election.voters.length === 0 || election.candidates.length < 2 || !election.opensAt || !election.closesAt} onClick={() => action('publish')}>{id ? 'Publish & kirim undangan' : 'Publish & send invitations'}</button>
        <button className="text-sm font-bold text-red-700 underline disabled:opacity-50" disabled={busy} onClick={remove}>{id ? 'Hapus draft' : 'Delete draft'}</button></div>
    </section> : <section className={`${cardClass} space-y-4`}>
      <h2 className="text-xl font-bold">{id ? 'Partisipasi & pengiriman' : 'Participation & delivery'}</h2>
      <p className="text-sm">{election._count.ballots} / {election._count.voters} {id ? 'sudah memilih' : 'have voted'} · {mailCounts.SENT || 0} {id ? 'undangan diterima layanan email' : 'invitations accepted by email service'} · {(mailCounts.QUEUED || 0) + (mailCounts.SENDING || 0)} {id ? 'diproses' : 'processing'} · {mailCounts.FAILED || 0} {id ? 'gagal' : 'failed'}</p>
      <p className="text-sm text-[#6b5a47]">{id ? 'Status diterima layanan email bukan bukti masuk inbox. Pemilih perlu memeriksa Spam/Promotions. Klik Muat ulang untuk status terbaru.' : 'Accepted by the email service does not guarantee inbox delivery. Voters should check Spam/Promotions. Refresh for current status.'}</p>
      {live && <div className="flex flex-wrap gap-3"><button className={secondaryClass} disabled={busy} onClick={() => action('retry')}>{id ? 'Lanjutkan / ulangi undangan yang gagal' : 'Resume / retry failed invitations'}</button><button className={secondaryClass} disabled={busy} onClick={() => action('close')}>{id ? 'Tutup voting sekarang' : 'Close voting now'}</button><button className="text-sm text-red-700 underline" disabled={busy} onClick={() => action('cancel')}>{id ? 'Batalkan pemilihan' : 'Cancel election'}</button></div>}
      <p className="text-xs text-[#6b5a47]">{id ? 'Pemilihan yang sudah dipublish tidak dapat dihapus atau diubah. Penutupan dan pembatalan mempertahankan catatan yang sudah masuk.' : 'Published elections cannot be deleted or edited. Closing or cancelling preserves existing records.'}</p>
    </section>}

    {!draft && <section className={`${cardClass} space-y-4`}>
      <h2 className="text-xl font-bold">{id ? 'Hasil akhir' : 'Final results'}</h2>
      {election.results ? <>
        {election.status === 'CANCELLED' && <p className="text-red-800">{id ? 'Pemilihan dibatalkan. Angka berikut adalah catatan, bukan hasil pemilihan yang sah.' : 'Election cancelled. These counts are a record, not a declared election result.'}</p>}
        {election.results.candidates.map(candidate => <div key={candidate.id} className="flex justify-between border-b border-[#E4DBCA] py-3"><span className="font-bold">{candidate.name}</span><span>{candidate.votes}</span></div>)}
        <p className="text-sm">Abstain: {election.results.abstentions} · Total: {election.results.total}</p>
        <p className="text-sm text-[#6b5a47]">{id ? 'Panitia memverifikasi hasil dan menentukan tindak lanjut jika seri. Sistem tidak memilih pemenang saat seri.' : 'The committee verifies results and resolves any tie. The system does not choose a winner in a tie.'}</p>
        <a href={`/api/admin/elections/${electionId}/results`} className={secondaryClass}>{id ? 'Unduh hasil CSV' : 'Download results CSV'}</a>
      </> : <p className="text-sm text-[#6b5a47]">{id ? 'Jumlah suara per kandidat disembunyikan sampai voting ditutup.' : 'Candidate totals stay hidden until voting closes.'}</p>}
    </section>}
    <p className="pb-4 text-xs leading-relaxed text-[#6b5a47]">{id ? 'Privasi: admin aplikasi dapat melihat siapa yang sudah memilih, tanpa pilihan individu. Ini bukan sistem anonimitas kriptografis terhadap pengelola database/server; akses database dan log harus dibatasi.' : 'Privacy: application administrators can see participation without individual choices. This is not cryptographic anonymity against database/server operators; restrict database and log access.'}</p>
  </div>;
}
