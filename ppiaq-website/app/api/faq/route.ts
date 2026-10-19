import { NextRequest, NextResponse } from 'next/server';
import { getPublicFAQs } from '@/lib/database/public-content';
import { PUBLIC_CACHE_HEADERS } from '@/lib/public-cache';

export async function GET(req: NextRequest) {
  try {
    const page = new URL(req.url).searchParams.get('page');
    const faqs = await getPublicFAQs(page || undefined);

    return NextResponse.json({
      data: faqs,
      message: `Retrieved ${faqs.length} FAQs`,
      meta: { total: faqs.length, page: page || 'all' },
    }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
