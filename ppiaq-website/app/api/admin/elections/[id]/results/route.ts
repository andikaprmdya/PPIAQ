import { NextRequest } from 'next/server';
import { electionDetail } from '@/lib/elections/service';
import { ElectionError } from '@/lib/elections/rules';
import { electionFailure, PRIVATE_HEADERS, requireElectionAdmin } from '@/lib/elections/http';

const csvCell = (value: string | number) => {
  const text = String(value);
  return '"' + (/^[=+@\-\t\r]/.test(text) ? "'" + text : text).replace(/"/g, '""') + '"';
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireElectionAdmin(request);
    const election = await electionDetail((await params).id);
    if (!election.results) throw new ElectionError(409, 'Candidate totals are available after voting closes');
    const rows: (string | number)[][] = [
      ['Election', election.title], ['Status', election.status], ['Eligible voters', election._count.voters],
      ['Total ballots', election.results.total], [], ['Candidate', 'Votes'],
      ...election.results.candidates.map(candidate => [candidate.name, candidate.votes]),
      ['Abstain', election.results.abstentions],
    ];
    return new Response('\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'), {
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="ppiaq-election-results.csv"' },
    });
  } catch (error) { return electionFailure(error); }
}
