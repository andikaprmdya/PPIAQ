import { NextRequest } from 'next/server';
import { z } from 'zod';
import { deleteElection, electionDetail, saveElection } from '@/lib/elections/service';
import { ElectionError } from '@/lib/elections/rules';
import { electionFailure, electionJson, requireElectionAdmin } from '@/lib/elections/http';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try { await requireElectionAdmin(request); return electionJson({ data: await electionDetail((await params).id) }); }
  catch (error) { return electionFailure(error); }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    await requireElectionAdmin(request, true);
    const { id } = await params;
    await saveElection(id, await request.json());
    return electionJson({ data: await electionDetail(id) });
  } catch (error) { return electionFailure(error); }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    await requireElectionAdmin(request, true);
    const parsed = z.object({ revision: z.number().int().nonnegative() }).strict().safeParse(await request.json());
    if (!parsed.success) throw new ElectionError(400, 'Draft revision is required');
    await deleteElection((await params).id, parsed.data.revision);
    return electionJson({ message: 'Draft deleted' });
  } catch (error) { return electionFailure(error); }
}
