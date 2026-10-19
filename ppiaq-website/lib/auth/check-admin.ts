import { getAuthenticatedUser } from './session';

/**
 * Shared admin check helper for API routes.
 * Returns the user if authenticated as admin, otherwise null.
 */
export async function checkAdmin() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}
