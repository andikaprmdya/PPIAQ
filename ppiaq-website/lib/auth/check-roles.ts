import { getAuthenticatedUser } from './session';

type AllowedRole = 'ADMIN' | 'CURATOR';

/**
 * Shared role checker for privileged API routes.
 * Returns authenticated user when their role is included in allowedRoles.
 */
export async function checkRoles(allowedRoles: AllowedRole[]) {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  if (!allowedRoles.includes(user.role as AllowedRole)) {
    return null;
  }

  return user;
}
