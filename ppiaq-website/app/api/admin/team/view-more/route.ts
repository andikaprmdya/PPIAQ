import { NextRequest, NextResponse } from 'next/server';
import {
  getAboutTeamViewMoreEnabled,
  setAboutTeamViewMoreEnabled,
} from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

export async function GET() {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const enabled = await getAboutTeamViewMoreEnabled();
    return NextResponse.json({ data: { enabled } }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching team view-more setting:', error);
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const enabled = Boolean(body?.enabled);
    await setAboutTeamViewMoreEnabled(enabled);

    return NextResponse.json({ data: { enabled } }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error updating team view-more setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
