import { NextRequest, NextResponse } from 'next/server';
import { getPublicContent } from '@/lib/database/public-content';
import { PUBLIC_CACHE_HEADERS } from '@/lib/public-cache';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page');
    const key = url.searchParams.get('key');

    if (!page && !key) {
      return NextResponse.json({ error: 'page or key parameter required' }, { status: 400 });
    }
    const data = await getPublicContent(page, key);

    return NextResponse.json({
      data,
      message: `Retrieved ${data.length} content items`,
      meta: { total: data.length },
    }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
