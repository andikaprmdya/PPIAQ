import { NextRequest } from 'next/server';
import { createElection, listElections } from '@/lib/elections/service';
import { electionFailure, electionJson, requireElectionAdmin } from '@/lib/elections/http';

export async function GET(request: NextRequest) {
  try { await requireElectionAdmin(request); return electionJson({ data: await listElections() }); }
  catch (error) { return electionFailure(error); }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireElectionAdmin(request, true);
    return electionJson({ data: await createElection(admin.id) }, 201);
  } catch (error) { return electionFailure(error); }
}
