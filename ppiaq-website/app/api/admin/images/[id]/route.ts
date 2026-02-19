import { NextRequest, NextResponse } from 'next/server';
import { deleteImageAsset } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const deleted = await deleteImageAsset(id);
    if (!deleted) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
