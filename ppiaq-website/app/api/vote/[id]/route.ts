import { NextRequest } from 'next/server';
import { z } from 'zod';
import { accessBallot, castBallot } from '@/lib/elections/service';
import { ElectionError } from '@/lib/elections/rules';
import { electionFailure, electionJson, requireSameOrigin } from '@/lib/elections/http';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const ballotRequest = z.discriminatedUnion('action', [
  z.object({ action: z.literal('access'), token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict(),
  z.object({ action: z.literal('vote'), token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), candidateId: z.string().min(1).max(128).nullable() }).strict(),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const limit = rateLimit(`election:${getClientIp(request)}`, { limit: 120, windowSec: 60 });
    if (!limit.success) return electionJson({ error: 'Too many attempts. Wait a minute and retry.' }, 429);
    const parsed = ballotRequest.safeParse(await request.json());
    if (!parsed.success) throw new ElectionError(400, 'Invalid ballot request. Open your personal invitation again.');
    const { id } = await params;
    const body = parsed.data;
    if (body.action === 'access') return electionJson({ data: await accessBallot(id, body.token) });
    await castBallot(id, body.token, body.candidateId);
    return electionJson({ message: 'Your anonymous vote has been recorded. Thank you.', hasVoted: true });
  } catch (error) { return electionFailure(error); }
}
