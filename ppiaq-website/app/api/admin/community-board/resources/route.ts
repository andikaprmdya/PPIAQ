import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { checkAdmin } from '@/lib/auth/check-admin';

const RESOURCE_CATEGORY_OPTIONS = [
  { en: 'Apartment', id: 'Apartemen' },
  { en: 'Housing', id: 'Perumahan' },
  { en: 'Accommodation & Housing', id: 'Akomodasi & Perumahan' },
  { en: 'Restaurants & Cafes', id: 'Restoran & Kafe' },
  { en: 'Learning Resources', id: 'Sumber Belajar' },
  { en: 'Transport & Mobility', id: 'Transportasi & Mobilitas' },
  { en: 'Health & Wellness', id: 'Kesehatan & Kebugaran' },
];

const isValidResourceCategory = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;
  const category = value as { en?: unknown; id?: unknown };
  if (typeof category.en !== 'string' || typeof category.id !== 'string') return false;
  return RESOURCE_CATEGORY_OPTIONS.some(
    (option) => option.en === category.en && option.id === category.id
  );
};

export async function GET() {
  try {
    const resources = await prisma.communityResource.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
    return NextResponse.json(resources);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!isValidResourceCategory(body.category)) {
      return NextResponse.json({ error: 'Invalid resource category' }, { status: 400 });
    }

    const resource = await prisma.communityResource.create({ data: body });
    return NextResponse.json(resource, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();
    if (!isValidResourceCategory(body.category)) {
      return NextResponse.json({ error: 'Invalid resource category' }, { status: 400 });
    }

    const resource = await prisma.communityResource.update({ where: { id }, data: body });
    return NextResponse.json(resource);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.communityResource.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
