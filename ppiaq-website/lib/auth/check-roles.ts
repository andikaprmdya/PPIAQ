import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/database/db';

type AllowedRole = 'ADMIN' | 'CURATOR';

/**
 * Shared role checker for privileged API routes.
 * Returns authenticated user when their role is included in allowedRoles.
 */
export async function checkRoles(allowedRoles: AllowedRole[]) {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('userEmail')?.value;
  if (!userEmail) return null;

  const user = await getUserByEmail(userEmail);
  if (!user) return null;

  if (!allowedRoles.includes(user.role as AllowedRole)) {
    return null;
  }

  return user;
}
