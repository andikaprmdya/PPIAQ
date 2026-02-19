import { NextRequest, NextResponse } from 'next/server';
import {
  getStaticContentByPage,
  createStaticContent,
} from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function GET(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const page = new URL(req.url).searchParams.get('page');
    if (!page) return NextResponse.json({ error: 'page parameter required' }, { status: 400 });

    const content = await getStaticContentByPage(page);
    return NextResponse.json({
      data: content,
      message: `Retrieved ${content.length} content items for ${page}`,
      meta: { total: content.length, page },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const body = await req.json();
    if (!body.key || !body.page || !body.type || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: key, page, type, content' },
        { status: 400 }
      );
    }

    const newContent = await createStaticContent({
      key: body.key,
      type: body.type,
      content: body.content,
      page: body.page,
      section: body.section || '',
      order: body.order || 999,
    });

    return NextResponse.json({ data: newContent, message: 'Content created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
