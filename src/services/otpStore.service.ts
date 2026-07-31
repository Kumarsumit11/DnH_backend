import crypto from 'crypto';

interface OtpEntry {
  hash: string;
  expiresAt: number;
  attempts: number;
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const store = new Map<string, OtpEntry>();

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function generateOtp(email: string): string {
  const otp = crypto.randomInt(100000, 999999).toString();
  store.set(email.toLowerCase(), {
    hash: hashOtp(otp),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0
  });
  return otp;
}

export function verifyOtp(email: string, otp: string): boolean {
  const key = email.toLowerCase();
  const entry = store.get(key);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return false;
  }

  entry.attempts += 1;

  const ok = entry.hash === hashOtp(otp);
  if (ok) store.delete(key);
  return ok;
}
