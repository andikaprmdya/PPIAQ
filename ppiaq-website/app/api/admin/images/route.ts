import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAllImageAssets,
  uploadImageAsset,
  getUserByEmail,
  isAdmin,
} from '@/lib/database/db';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    if (!userEmail) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const category = new URL(req.url).searchParams.get('category');
    const images = getAllImageAssets(category || undefined);

    return NextResponse.json({
      data: images,
      message: `Retrieved ${images.length} images`,
      meta: { total: images.length, category: category || 'all' },
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    if (!userEmail) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const body = await req.json();
    if (!body.name || !body.base64Data || !body.mimeType || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, base64Data, mimeType, category' },
        { status: 400 }
      );
    }

    const sizeInBytes = Buffer.byteLength(body.base64Data, 'utf-8');
    const newImage = uploadImageAsset({
      name: body.name,
      description: body.description,
      base64Data: body.base64Data,
      mimeType: body.mimeType,
      size: sizeInBytes,
      category: body.category,
      usedIn: [],
      uploadedBy: user.id,
    });

    return NextResponse.json({ data: newImage, message: 'Image uploaded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
