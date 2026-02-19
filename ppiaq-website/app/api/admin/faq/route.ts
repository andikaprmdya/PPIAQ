import { NextRequest, NextResponse } from 'next/server';
import {
  getAllFAQs,
  createFAQ,
  reorderFAQs,
} from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function GET(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const faqs = await getAllFAQs();
    return NextResponse.json({
      data: faqs,
      message: `Retrieved ${faqs.length} FAQs`,
      meta: { total: faqs.length },
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const body = await req.json();
    if (!body.question || !body.answer || !body.page) {
      return NextResponse.json(
        { error: 'Missing required fields: question, answer, page' },
        { status: 400 }
      );
    }

    const newFAQ = await createFAQ({
      question: body.question,
      answer: body.answer,
      page: body.page,
      order: body.order || 999,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ data: newFAQ, message: 'FAQ created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const body = await req.json();
    if (!Array.isArray(body.ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    const success = await reorderFAQs(body.ids);
    if (!success) return NextResponse.json({ error: 'Failed to reorder FAQs' }, { status: 500 });

    return NextResponse.json({ message: 'FAQs reordered successfully' });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    return NextResponse.json({ error: 'Failed to reorder FAQs' }, { status: 500 });
  }
}
