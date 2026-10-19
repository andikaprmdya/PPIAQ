import { ElectionMailBatch, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import { formatElectionDate } from './rules';
import { ElectionError } from './rules';
import { tokenHash, votingToken, votingUrl } from './tokens';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

export function invitationPreview(election: {
  title: string; emailSubject: string; emailBody: string; opensAt: Date | string | null; closesAt: Date | string | null;
}, voter = { name: 'Anggota PPIAQ', voterId: 'PPIAQ-CONTOH' }, link = 'https://ppiaqueensland.org/vote/example#token=EXAMPLE') {
  const values: Record<string, string> = {
    firstName: voter.name.split(' ')[0], electionTitle: election.title, voterId: voter.voterId,
    opensAt: formatElectionDate(election.opensAt), closesAt: formatElectionDate(election.closesAt), votingLink: link,
  };
  const subject = election.emailSubject.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
  const body = escapeHtml(election.emailBody).replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'votingLink') return `<a href="${escapeHtml(link)}" style="color:#B64847;font-weight:bold">Buka surat suara / Open ballot</a>`;
    return values[key] !== undefined ? escapeHtml(values[key]) : match;
  }).replace(/\n/g, '<br>');
  const html = `<!doctype html><html lang="id"><body style="margin:0;background:#FFFAF5;font:16px/1.7 Arial,sans-serif;color:#303030"><div style="max-width:600px;margin:24px auto;padding:32px;background:white;border:1px solid #E4DBCA;border-radius:16px"><p style="color:#B64847;font-weight:bold;letter-spacing:2px">PPIAQ · PEMILIHAN</p><h1 style="font-size:26px">${escapeHtml(election.title)}</h1><p>${body}</p><hr style="border:0;border-top:1px solid #E4DBCA"><p style="font-size:13px">Tautan pribadi ini memberi akses satu suara. Jangan bagikan. Admin melihat status partisipasi, tanpa pilihan individu.<br>Your personal link permits one vote. Keep it private. Administrators see participation status without individual choices.</p></div></body></html>`;
  return { subject, html };
}

export async function sendInvitationBatch(batchId: string, fetcher: typeof fetch = fetch) {
  const batch = await prisma.electionMailBatch.findUnique({ where: { id: batchId }, include: {
    election: true, voters: { orderBy: { id: 'asc' }, select: { id: true, electionId: true, tokenNonce: true, tokenHash: true, name: true, email: true, voterId: true } },
  } });
  if (!batch || batch.election.status !== 'PUBLISHED' || !batch.election.closesAt || batch.election.closesAt <= new Date()) {
    return { success: false, code: 'ELECTION_ENDED' };
  }
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { success: false, code: 'EMAIL_NOT_CONFIGURED' };
  if (!batch.voters.every(voter => voter.tokenHash === tokenHash(votingToken(voter)))) return { success: false, code: 'TOKEN_SECRET_CHANGED' };
  try {
    const response = await fetcher('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { email: 'qld@ppi-australia.org', name: 'Panitia Pemilihan PPIAQ' },
        replyTo: { email: 'qld@ppi-australia.org', name: 'PPIAQ' },
        subject: batch.election.title,
        htmlContent: '<p>Undangan pemilihan PPIAQ</p>',
        headers: { idempotencyKey: batch.id },
        tags: ['ppiaq-election'],
        messageVersions: batch.voters.map(voter => {
          const message = invitationPreview(batch.election, voter, votingUrl(voter));
          // Exactly one recipient per message; never CC/BCC the voter register.
          return { to: [{ email: voter.email, name: voter.name }], subject: message.subject, htmlContent: message.html };
        }),
      }),
    });
    const data = await response.json() as { code?: string; messageIds?: string[] };
    // Brevo acknowledges a retry with the same key as duplicate_parameter.
    if (data.code === 'duplicate_parameter') return { success: true, code: null };
    if (!response.ok) return { success: false, code: `PROVIDER_HTTP_${response.status}` };
    if (!Array.isArray(data.messageIds) || data.messageIds.length !== batch.voters.length) return { success: false, code: 'PROVIDER_RESPONSE_UNCERTAIN' };
    return { success: true, code: null };
  } catch {
    // Never log email bodies, bearer tokens, recipient addresses or ballot data.
    return { success: false, code: 'NETWORK_OR_TIMEOUT' };
  }
}

async function claimBatch(electionId: string) {
  const rows = await prisma.$queryRaw<ElectionMailBatch[]>(Prisma.sql`
    UPDATE election_mail_batches SET status = 'SENDING', attempts = attempts + 1,
      "lockedUntil" = (NOW() AT TIME ZONE 'UTC') + INTERVAL '2 minutes', "errorCode" = NULL
    WHERE id = (
      SELECT batch.id FROM election_mail_batches AS batch
      JOIN elections AS election ON election.id = batch."electionId"
      WHERE batch."electionId" = ${electionId} AND election.status = 'PUBLISHED'
        AND election."closesAt" > (NOW() AT TIME ZONE 'UTC')
        AND (batch.status = 'QUEUED' OR (batch.status = 'SENDING' AND batch."lockedUntil" < (NOW() AT TIME ZONE 'UTC')))
      ORDER BY batch.id FOR UPDATE OF batch SKIP LOCKED LIMIT 1
    ) RETURNING *
  `);
  return rows[0] || null;
}

export async function dispatchElectionMail(electionId: string, fetcher: typeof fetch = fetch) {
  // A durable batch lease and provider idempotency make concurrent retries safe.
  // Three workers send all batches independently of the browser tab's lifetime.
  await Promise.all(Array.from({ length: 3 }, async () => {
    for (;;) {
      const batch = await claimBatch(electionId);
      if (!batch) return;
      let result = await sendInvitationBatch(batch.id, fetcher);
      if (!result.success && result.code !== 'ELECTION_ENDED') {
        // One automatic retry covers transient failures without silently dropping
        // recipients. Remaining failures stay visible for an admin retry.
        result = await sendInvitationBatch(batch.id, fetcher);
      }
      await prisma.electionMailBatch.update({ where: { id: batch.id }, data: {
        status: result.success ? 'SENT' : 'FAILED', errorCode: result.code,
        acceptedAt: result.success ? new Date() : null, lockedUntil: null,
      } });
    }
  }));
}

export async function retryElectionMail(id: string) {
  const election = await prisma.election.findUnique({ where: { id }, select: { status: true, closesAt: true } });
  if (!election || election.status !== 'PUBLISHED' || !election.closesAt || election.closesAt <= new Date()) return false;
  await prisma.electionMailBatch.updateMany({
    where: { electionId: id, status: 'FAILED', errorCode: { not: 'ELECTION_ENDED' } },
    data: { status: 'QUEUED', errorCode: null },
  });
  return true;
}

export async function resendVoterInvitation(electionId: string, voterId: string) {
  await prisma.$transaction(async tx => {
    const elections = await tx.$queryRaw<{ status: string; closesAt: Date | null }[]>`
      SELECT status, "closesAt" FROM elections WHERE id = ${electionId} FOR UPDATE
    `;
    if (elections[0]?.status !== 'PUBLISHED' || !elections[0].closesAt || elections[0].closesAt <= new Date()) {
      throw new ElectionError(409, 'The election is not open for invitations');
    }
    const voter = await tx.electionVoter.findFirst({ where: { id: voterId, electionId }, include: { mailBatch: true } });
    if (!voter) throw new ElectionError(404, 'Voter not found');
    if (voter.hasVoted) throw new ElectionError(409, 'This member has already voted; another vote cannot be issued');
    if (voter.mailBatch?.status !== 'SENT') throw new ElectionError(409, 'Use Resume / retry for an invitation that is still queued or failed');
    const batch = await tx.electionMailBatch.create({ data: { electionId } });
    // Reuse the credential and frozen email. Never create a second voting right.
    await tx.electionVoter.update({ where: { id: voter.id }, data: { mailBatchId: batch.id } });
  });
}
