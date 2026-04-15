import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

export const TEMP_IMPORTED_MEMBER_PASSWORD = 'TempPass123!';
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes
const FALLBACK_RESET_SECRET = 'ppiaq-password-reset-secret';

interface PasswordResetPayload {
  userId: string;
  email: string;
  expiresAt: number;
  passwordFingerprint: string;
  nonce: string;
}

export function getPasswordFingerprint(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 24);
}

function getResetSecret(): string {
  return (
    process.env.PASSWORD_RESET_SECRET ||
    process.env.BREVO_API_KEY ||
    process.env.DATABASE_URL ||
    FALLBACK_RESET_SECRET
  );
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payloadPart: string): string {
  return createHmac('sha256', getResetSecret()).update(payloadPart).digest('base64url');
}

export function createPasswordResetToken(
  userId: string,
  email: string,
  passwordHash: string
): string {
  const payload: PasswordResetPayload = {
    userId,
    email: email.toLowerCase().trim(),
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    passwordFingerprint: getPasswordFingerprint(passwordHash),
    nonce: randomBytes(16).toString('hex'),
  };

  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signaturePart = signPayload(payloadPart);
  return `${payloadPart}.${signaturePart}`;
}

type VerificationResult =
  | { valid: true; payload: PasswordResetPayload }
  | { valid: false; error: string };

export function verifyPasswordResetToken(token: string): VerificationResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid reset token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid reset token format' };
  }

  const [payloadPart, signaturePart] = parts;
  const expectedSignature = signPayload(payloadPart);
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const providedBuffer = Buffer.from(signaturePart, 'utf8');

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return { valid: false, error: 'Invalid reset token signature' };
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payloadPart)) as Partial<PasswordResetPayload>;
    if (
      !parsed ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      typeof parsed.passwordFingerprint !== 'string' ||
      typeof parsed.nonce !== 'string'
    ) {
      return { valid: false, error: 'Invalid reset token payload' };
    }

    if (parsed.expiresAt <= Date.now()) {
      return { valid: false, error: 'Reset token has expired' };
    }

    return {
      valid: true,
      payload: {
        userId: parsed.userId,
        email: parsed.email,
        expiresAt: parsed.expiresAt,
        passwordFingerprint: parsed.passwordFingerprint,
        nonce: parsed.nonce,
      },
    };
  } catch {
    return { valid: false, error: 'Invalid reset token data' };
  }
}

export function getPasswordResetTokenTtlMinutes(): number {
  return Math.floor(RESET_TOKEN_TTL_MS / (60 * 1000));
}
