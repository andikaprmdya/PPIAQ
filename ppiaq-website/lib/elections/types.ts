export type CandidateView = { id: string; name: string; manifesto: string; order?: number };
export type ElectionView = {
  id: string; title: string; description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
  opensAt: string | null; closesAt: string | null;
  allowAbstain: boolean; emailSubject: string; emailBody: string; revision: number;
  candidates: CandidateView[];
  voters: {
    id: string; userId: string; voterId: string; name: string; email: string; hasVoted: boolean;
    mailBatch: { status: string; errorCode: string | null; acceptedAt: string | null; lockedUntil: string | null } | null;
  }[];
  _count: { voters: number; ballots: number };
  results: { candidates: { id: string; name: string; votes: number }[]; abstentions: number; total: number } | null;
};

export type ElectionMember = {
  id: string; firstName: string; lastName: string; email: string; memberNo: string | null;
  university: string; membershipType: string; eligible: boolean; reason: string; endsAt: string | null;
};

export type BallotView = {
  voterId: string; hasVoted: boolean;
  election: Pick<ElectionView, 'id' | 'title' | 'description' | 'status' | 'opensAt' | 'closesAt' | 'allowAbstain' | 'candidates'>;
};
