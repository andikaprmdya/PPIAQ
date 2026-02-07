import { NextRequest, NextResponse } from 'next/server';
import { getAllFAQs } from '@/lib/database/db';

export async function GET(req: NextRequest) {
  try {
    const page = new URL(req.url).searchParams.get('page');
    const faqs = getAllFAQs(page || undefined);

    return NextResponse.json({
      data: faqs,
      message: `Retrieved ${faqs.length} FAQs`,
      meta: { total: faqs.length, page: page || 'all' },
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
