import { cookies } from 'next/headers';
import { getUserByEmail, isAdminUser } from '@/lib/database/db';

/**
 * Shared admin check helper for API routes.
 * Uses isAdminUser() to avoid an extra DB query — the user object from
 * getUserByEmail() already contains the role field.
 *
 * Returns the user if authenticated as admin, otherwise null.
 */
export async function checkAdmin() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('userEmail')?.value;
  if (!userEmail) return null;
  const user = await getUserByEmail(userEmail);
  if (!user || !isAdminUser(user)) return null;
  return user;
}
