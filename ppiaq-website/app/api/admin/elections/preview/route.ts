import { NextRequest } from 'next/server';
import { invitationPreview } from '@/lib/elections/mail';
import { validateDraft } from '@/lib/elections/rules';
import { electionFailure, electionJson, requireElectionAdmin } from '@/lib/elections/http';

export async function POST(request: NextRequest) {
  try {
    await requireElectionAdmin(request, true);
    return electionJson(invitationPreview(validateDraft(await request.json())));
  } catch (error) { return electionFailure(error); }
}
