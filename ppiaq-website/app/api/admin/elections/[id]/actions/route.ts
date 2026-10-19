import { after, NextRequest } from 'next/server';
import { z } from 'zod';
import { endElection, publishElection } from '@/lib/elections/service';
import { dispatchElectionMail, resendVoterInvitation, retryElectionMail } from '@/lib/elections/mail';
import { ElectionError } from '@/lib/elections/rules';
import { electionFailure, electionJson, requireElectionAdmin } from '@/lib/elections/http';

export const maxDuration = 300;

const actionSchema = z.object({
  action: z.enum(['publish', 'close', 'cancel', 'retry', 'resend']),
  revision: z.number().int().nonnegative().optional(),
  financialConfirmed: z.boolean().optional(),
  voterId: z.string().min(1).max(128).optional(),
}).strict();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireElectionAdmin(request, true);
    const { id } = await params;
    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) throw new ElectionError(400, 'Invalid election action');
    const body = parsed.data;
    if (body.action === 'publish') {
      if (body.revision === undefined) throw new ElectionError(400, 'Save the draft before publishing');
      await publishElection(id, body.revision, body.financialConfirmed === true);
    } else if (body.action === 'retry') {
      if (!await retryElectionMail(id)) throw new ElectionError(409, 'The election is not open for invitations');
    } else if (body.action === 'resend') {
      if (!body.voterId) throw new ElectionError(400, 'Select a voter');
      await resendVoterInvitation(id, body.voterId);
    } else {
      await endElection(id, body.action === 'close' ? 'CLOSED' : 'CANCELLED');
    }
    if (body.action === 'publish' || body.action === 'retry' || body.action === 'resend') {
      after(async () => {
        try { await dispatchElectionMail(id); }
        catch { console.error('Election email job interrupted; batches remain available for retry.'); }
      });
    }
    return electionJson({ message: body.action === 'publish' ? 'Election published. Private invitations are queued for sending.' : 'Election updated' });
  } catch (error) { return electionFailure(error); }
}
