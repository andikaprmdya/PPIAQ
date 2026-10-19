import { NextResponse } from 'next/server';
import { getPublicCommunityBoard } from '@/lib/database/public-content';
import { PUBLIC_CACHE_HEADERS } from '@/lib/public-cache';

export async function GET() {
  try {
    const data = await getPublicCommunityBoard();
    return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADERS });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
