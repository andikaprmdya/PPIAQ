import { z } from 'zod';

export const DEFAULT_ELECTION_SUBJECT = 'Undangan memilih — {{electionTitle}}';
export const DEFAULT_ELECTION_BODY = `Halo {{firstName}},

Anda terdaftar sebagai pemilih untuk {{electionTitle}}.
Voter ID: {{voterId}}

Voting dibuka: {{opensAt}}
Voting ditutup: {{closesAt}}

Klik tautan pribadi berikut untuk memilih:
{{votingLink}}

Anda hanya dapat mengirim satu suara. Pilihan Anda tidak ditampilkan bersama identitas Anda kepada admin. Jangan meneruskan tautan ini kepada siapa pun.

Jika ada kesalahan data atau pertanyaan, hubungi qld@ppi-australia.org.

Salam,
Panitia Pemilihan PPIAQ`;

export const draftSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(8000),
  opensAt: z.iso.datetime({ offset: true }).nullable(),
  closesAt: z.iso.datetime({ offset: true }).nullable(),
  allowAbstain: z.boolean(),
  emailSubject: z.string().trim().min(3).max(180),
  emailBody: z.string().trim().min(20).max(12000),
  candidates: z.array(z.object({
    name: z.string().trim().min(1).max(120),
    manifesto: z.string().trim().max(6000),
  }).strict()).max(20),
  voterUserIds: z.array(z.string().min(1).max(128)).max(1000),
  revision: z.number().int().nonnegative(),
}).strict();

export type DraftInput = z.infer<typeof draftSchema>;

export class ElectionError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Membership = {
  status: string; university: string; nationality: string;
  dateJoined: Date | null; approvedAt: Date | null; createdAt: Date;
  membershipTermEnds: Date | null;
};

export function membershipEligibility(member: Membership, at: Date): { eligible: boolean; reason: string; endsAt: Date | null } {
  let endsAt = member.membershipTermEnds;
  const startsAt = member.dateJoined || member.approvedAt || member.createdAt;
  if (!endsAt) {
    endsAt = new Date(startsAt);
    endsAt.setUTCFullYear(endsAt.getUTCFullYear() + 1);
  }
  if (member.status !== 'APPROVED') return { eligible: false, reason: 'Membership is not approved', endsAt };
  if (startsAt > at) return { eligible: false, reason: 'Membership has not started at the voting opening time', endsAt };
  if (endsAt <= at) return { eligible: false, reason: 'Membership expires before voting opens', endsAt };
  return { eligible: true, reason: 'Active membership — admin must verify payment', endsAt };
}

export function formatElectionDate(value: Date | string | null) {
  if (!value) return 'Belum dijadwalkan / Not scheduled';
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane', dateStyle: 'long', timeStyle: 'short',
  }).format(new Date(value)) + ' AEST (Brisbane)';
}

export function validateDraft(input: unknown) {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) throw new ElectionError(400, parsed.error.issues[0]?.message || 'Invalid draft');
  const data = parsed.data;
  if (new Set(data.voterUserIds).size !== data.voterUserIds.length) throw new ElectionError(400, 'A member can only be tagged once');
  if (data.opensAt && data.closesAt && new Date(data.opensAt) >= new Date(data.closesAt)) {
    throw new ElectionError(400, 'Voting must close after it opens');
  }
  const names = data.candidates.map(candidate => candidate.name.toLowerCase());
  if (new Set(names).size !== names.length) throw new ElectionError(400, 'Candidate names must be distinct');
  if (!data.emailBody.includes('{{votingLink}}') || !data.emailBody.includes('{{voterId}}')) throw new ElectionError(400, 'Email must include {{votingLink}} and {{voterId}}');
  const allowed = new Set(['firstName', 'electionTitle', 'voterId', 'votingLink', 'opensAt', 'closesAt']);
  for (const match of (data.emailBody + data.emailSubject).matchAll(/\{\{([^}]+)\}\}/g)) {
    if (!allowed.has(match[1])) throw new ElectionError(400, `Unknown email placeholder: {{${match[1]}}}`);
  }
  if (/[\r\n]/.test(data.emailSubject)) throw new ElectionError(400, 'Email subject must be one line');
  return data;
}
