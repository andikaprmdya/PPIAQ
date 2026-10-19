import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// A lightweight deployment identity check. No database access or private env
// values: the Git SHA is already public in the source repository.
export async function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    bandwidthFixVersion: 1,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
