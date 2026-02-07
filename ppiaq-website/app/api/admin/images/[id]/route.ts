import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteImageAsset, getUserByEmail, isAdmin } from '@/lib/database/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    if (!userEmail) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const deleted = deleteImageAsset(id);
    if (!deleted) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
