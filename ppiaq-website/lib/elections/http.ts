import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '../auth/check-admin';
import { ElectionError } from './rules';

export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' };

export function electionJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: PRIVATE_HEADERS });
}

export function requireSameOrigin(request: NextRequest) {
  // NextURL normalizes loopback hosts to localhost. Compare against the actual
  // HTTP Host so a legitimate browser using 127.0.0.1 is not rejected.
  const host = request.headers.get('host') || request.nextUrl.host;
  const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || request.nextUrl.protocol.slice(0, -1);
  try {
    const origin = new URL(request.headers.get('origin') || '');
    if (origin.host.toLowerCase() === host.toLowerCase() && origin.protocol === protocol + ':') return;
  } catch { /* A missing, opaque or invalid origin is rejected below. */ }
  throw new ElectionError(403, 'Refresh this page and try again from the PPIAQ website');
}

export async function requireElectionAdmin(request: NextRequest, write = false) {
  if (write) requireSameOrigin(request);
  const admin = await checkAdmin();
  if (!admin) throw new ElectionError(403, 'Admin sign-in required. Sign in again if your session has expired.');
  return admin;
}

export function electionFailure(error: unknown) {
  if (error instanceof ElectionError) return electionJson({ error: error.message }, error.status);
  if (error instanceof SyntaxError) return electionJson({ error: 'Invalid request body' }, 400);
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN';
  console.error('Election operation failed:', code);
  if (code === 'P2021' || code === 'P2022') return electionJson({ error: 'Election database update is required. Run the election migration before using this page.' }, 503);
  return electionJson({ error: 'The operation could not be completed. Refresh and try again.' }, 500);
}
