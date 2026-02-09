import { NextRequest, NextResponse } from 'next/server';
import { getStaticContentByPage, getStaticContentByKey } from '@/lib/database/db';

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
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
