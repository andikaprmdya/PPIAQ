/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Limits requests per IP per time window.
 * Resets automatically after the window expires.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
}

/**
 * Returns { success: true } if request is allowed, or
 * { success: false, retryAfter } if rate limit exceeded.
 */
export function rateLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions
): { success: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfter };
  }

  entry.count++;
  return { success: true };
}

/**
 * Extract IP from NextRequest headers (works with Vercel/proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
