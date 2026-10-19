import { createHash, createHmac } from 'node:crypto';

function tokenSecret() {
  const secret = process.env.ELECTION_TOKEN_SECRET || process.env.AUTH_SECRET || process.env.PASSWORD_RESET_SECRET || process.env.DATABASE_URL;
  if (!secret || secret.length < 32) throw new Error('A private election token secret is required');
  return secret;
}

// Deterministic for retrying invitations; raw tokens are never stored in tables.
export function votingToken(voter: { id: string; electionId: string; tokenNonce: string }) {
  return createHmac('sha256', tokenSecret())
    .update(`ppiaq-vote-v1:${voter.electionId}:${voter.id}:${voter.tokenNonce}`).digest('base64url');
}

export function tokenHash(token: string) { return createHash('sha256').update(token).digest('hex'); }

export function votingUrl(voter: { id: string; electionId: string; tokenNonce: string }) {
  const origin = process.env.ELECTION_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ppiaqueensland.org';
  const url = new URL(`/vote/${voter.electionId}`, origin);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Election invitations require HTTPS');
  // Fragments never reach the web server or its URL/access logs.
  url.hash = new URLSearchParams({ token: votingToken(voter) }).toString();
  return url.toString();
}
