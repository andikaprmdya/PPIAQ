import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/database/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user;
    return Response.json(userWithoutPassword);
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
