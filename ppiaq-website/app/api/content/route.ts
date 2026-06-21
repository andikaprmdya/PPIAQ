import { NextRequest, NextResponse } from 'next/server';
import { getStaticContentByPage, getStaticContentByKey } from '@/lib/database/db';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page');
    const key = url.searchParams.get('key');

    let data;
    if (key) {
      const content = await getStaticContentByKey(key);
      data = content ? [content] : [];
    } else if (page) {
      data = await getStaticContentByPage(page);
    } else {
      return NextResponse.json({ error: 'page or key parameter required' }, { status: 400 });
    }

    return NextResponse.json({
      data,
      message: `Retrieved ${data.length} content items`,
      meta: { total: data.length },
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
