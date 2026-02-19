import { NextRequest, NextResponse } from 'next/server';
import { getFAQById, updateFAQ, deleteFAQ } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const faq = await getFAQById(id);
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });

    return NextResponse.json({ data: faq });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const updated = await updateFAQ(id, body);

    if (!updated) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'FAQ updated successfully' });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const deleted = await deleteFAQ(id);
    if (!deleted) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
