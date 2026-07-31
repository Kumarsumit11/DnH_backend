import jwt from 'jsonwebtoken';
import { generateOtp, verifyOtp } from './otpStore.service';
import { emailService } from '../emails/email.service';

function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const adminAuthService = {
  isAllowedAdmin(email: string): boolean {
    return getAllowedAdminEmails().includes(email.trim().toLowerCase());
  },

  async requestOtp(email: string) {
    if (!this.isAllowedAdmin(email)) {
      // Don't reveal whether the email is a recognized admin.
      return;
    }
    const otp = generateOtp(email);
    await emailService.sendOtpEmail(email, otp, 'admin login');
  },

  verifyOtpAndIssueToken(email: string, otp: string): string {
    if (!this.isAllowedAdmin(email)) {
      throw new Error('Unauthorized');
    }
    const ok = verifyOtp(email, otp);
    if (!ok) {
      throw new Error('Invalid or expired OTP');
    }

    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      throw new Error('ADMIN_JWT_SECRET not set in env');
    }

    return jwt.sign({ email: email.toLowerCase(), role: 'ADMIN' }, secret, { expiresIn: '8h' });
  }
};
