import { NextRequest, NextResponse } from 'next/server';
import { getPublicMedia, isPublicMediaRequest } from '@/lib/database/public-content';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const field = req.nextUrl.searchParams.get('field') || 'image';
  const notFound = () => NextResponse.json({ error: 'Image not found' }, {
    status: 404, headers: { 'Cache-Control': 'no-store' },
  });
  // Never expose user records, payment proofs, drafts, or inactive team images.
  if (!isPublicMediaRequest(kind, field) || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return notFound();

  try {
    const image = await getPublicMedia(kind, id, field);
    if (!image) return notFound();

    return new Response(new Uint8Array(Buffer.from(image, 'base64')), {
      headers: {
        'Content-Type': 'image/webp',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=300, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching public image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, {
      status: 500, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
