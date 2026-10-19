import { NextRequest } from 'next/server';
import { electionMembers } from '@/lib/elections/service';
import { ElectionError } from '@/lib/elections/rules';
import { electionFailure, electionJson, requireElectionAdmin } from '@/lib/elections/http';

export async function GET(request: NextRequest) {
  try {
    await requireElectionAdmin(request);
    const raw = request.nextUrl.searchParams.get('at');
    const at = raw ? new Date(raw) : new Date();
    if (Number.isNaN(at.getTime())) throw new ElectionError(400, 'Invalid eligibility date');
    return electionJson({ data: await electionMembers(at) });
  } catch (error) { return electionFailure(error); }
}
