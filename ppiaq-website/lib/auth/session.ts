import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '../database/prisma';

export const SESSION_COOKIE = 'ppiaqSession';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.PASSWORD_RESET_SECRET || process.env.DATABASE_URL;
  if (!value || value.length < 32) throw new Error('A private session secret is required');
  return value;
}

function fingerprint(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

type SessionUser = { id: string; email: string; role: string; password: string };
type Session = { id: string; email: string; role: string; fingerprint: string; expires: number };

export function createSession(user: SessionUser, now = Date.now()) {
  const data = Buffer.from(JSON.stringify({
    id: user.id, email: user.email, role: user.role,
    fingerprint: fingerprint(user.password), expires: now + SESSION_SECONDS * 1000,
  })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(`session-v1:${data}`).digest('base64url');
  return `${data}.${signature}`;
}

export function verifySession(token: string | undefined, now = Date.now()): Session | null {
  if (!token || token.length > 2048) return null;
  const [data, signature, extra] = token.split('.');
  if (!data || !signature || extra) return null;
  const expected = createHmac('sha256', secret()).update(`session-v1:${data}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString()) as Session;
    if (typeof session.id !== 'string' || typeof session.email !== 'string' ||
      !['ADMIN', 'USER', 'CURATOR'].includes(session.role) ||
      typeof session.fingerprint !== 'string' || !Number.isFinite(session.expires) || session.expires <= now) return null;
    return session;
  } catch { return null; }
}

export async function getAuthenticatedUser() {
  const store = await cookies();
  const session = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || user.status !== 'APPROVED' || user.email !== session.email ||
    fingerprint(user.password) !== session.fingerprint) return null;
  return user;
}
