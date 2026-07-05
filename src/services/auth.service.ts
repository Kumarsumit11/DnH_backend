import { accountRepository } from '../repositories/account.repository';
import { verificationRepository } from '../repositories/verification.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { hashPassword, comparePassword, hashToken, compareToken } from '../utils/hash';
import { generateOtp } from '../utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { emailService } from '../emails/email.service';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';
import { VerificationPurpose, AccountStatus } from '@prisma/client';
import { Role } from '../constants/roles';
import { auditRepository } from '../repositories/audit.repository';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

async function createAndSendOtp(accountId: string, email: string, purpose: VerificationPurpose) {
  await verificationRepository.invalidateAllForPurpose(accountId, purpose);
  const otp = generateOtp(6);
  const codeHash = await hashToken(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await verificationRepository.create(accountId, purpose, codeHash, expiresAt);

  const purposeLabel = purpose === VerificationPurpose.EMAIL_VERIFICATION ? 'email verification' : 'password reset';
  await emailService.sendOtpEmail(email, otp, purposeLabel);
}

async function issueTokens(accountId: string, email: string, role: Role, userAgent?: string, ipAddress?: string) {
  const accessToken = signAccessToken({ sub: accountId, email, role });
  const refreshToken = signRefreshToken({ sub: accountId });

  const tokenHash = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await refreshTokenRepository.create(accountId, tokenHash, expiresAt, userAgent, ipAddress);

  return { accessToken, refreshToken };
}

export const authService = {
  async registerInvestor(email: string, password: string, fullName: string, phone?: string, address?: string) {
    const existing = await accountRepository.findByEmail(email);
    if (existing) throw AppError.conflict('An account with this email already exists', ErrorCode.CONFLICT);

    const passwordHash = await hashPassword(password);
    const account = await accountRepository.createInvestor(email, passwordHash, fullName, phone, address);
    await createAndSendOtp(account.id, email, VerificationPurpose.EMAIL_VERIFICATION);
    await auditRepository.log('CREATE', 'Account', account.id, account.id, { role: 'INVESTOR' });

    return { id: account.id, email: account.email, role: account.role };
  },

  async registerCompany(email: string, password: string, companyName: string, phone?: string, address?: string) {
    const existing = await accountRepository.findByEmail(email);
    if (existing) throw AppError.conflict('An account with this email already exists', ErrorCode.CONFLICT);

    const passwordHash = await hashPassword(password);
    const account = await accountRepository.createCompany(email, passwordHash, companyName, phone, address);
    await createAndSendOtp(account.id, email, VerificationPurpose.EMAIL_VERIFICATION);
    await auditRepository.log('CREATE', 'Account', account.id, account.id, { role: 'COMPANY' });

    return { id: account.id, email: account.email, role: account.role };
  },

  async verifyEmail(email: string, otp: string) {
    const account = await accountRepository.findByEmail(email);
    if (!account) throw AppError.notFound('Account not found');
    if (account.isEmailVerified) throw AppError.badRequest('Email already verified');

    const verification = await verificationRepository.findLatestActive(account.id, VerificationPurpose.EMAIL_VERIFICATION);
    if (!verification) throw AppError.badRequest('No active verification code. Please request a new one.', ErrorCode.OTP_EXPIRED);

    if (verification.attempts >= MAX_OTP_ATTEMPTS) {
      throw AppError.badRequest('Too many failed attempts. Please request a new code.', ErrorCode.OTP_INVALID);
    }

    const isValid = await compareToken(otp, verification.codeHash);
    if (!isValid) {
      await verificationRepository.incrementAttempts(verification.id);
      throw AppError.badRequest('Invalid verification code', ErrorCode.OTP_INVALID);
    }

    await verificationRepository.markConsumed(verification.id);
    await accountRepository.markEmailVerified(account.id);

    const name =
      (account as any).investorProfile?.fullName || (account as any).companyProfile?.companyName || 'there';
    await emailService.sendWelcomeEmail(email, name);
    await auditRepository.log('UPDATE', 'Account', account.id, account.id, { action: 'email_verified' });

    return { message: 'Email verified successfully' };
  },

  async resendOtp(email: string, purpose: VerificationPurpose = VerificationPurpose.EMAIL_VERIFICATION) {
    const account = await accountRepository.findByEmail(email);
    if (!account) throw AppError.notFound('Account not found');
    if (purpose === VerificationPurpose.EMAIL_VERIFICATION && account.isEmailVerified) {
      throw AppError.badRequest('Email already verified');
    }
    await createAndSendOtp(account.id, email, purpose);
    return { message: 'Verification code sent' };
  },

  async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const account = await accountRepository.findByEmail(email);
    if (!account) throw AppError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);

    const isValid = await comparePassword(password, account.passwordHash);
    if (!isValid) throw AppError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);

    if (!account.isEmailVerified) {
      throw AppError.forbidden('Please verify your email before logging in', ErrorCode.EMAIL_NOT_VERIFIED);
    }

    if (account.status === AccountStatus.SUSPENDED) {
      throw AppError.forbidden('Your account has been suspended. Contact support.', ErrorCode.FORBIDDEN);
    }
    if (account.status === AccountStatus.DEACTIVATED) {
      throw AppError.forbidden('Your account has been deactivated.', ErrorCode.FORBIDDEN);
    }

    const tokens = await issueTokens(account.id, account.email, account.role as Role, userAgent, ipAddress);
    await auditRepository.log('LOGIN', 'Account', account.id, account.id, undefined, ipAddress);

    return {
      ...tokens,
      account: { id: account.id, email: account.email, role: account.role, status: account.status }
    };
  },

  async refreshAccessToken(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token', ErrorCode.TOKEN_EXPIRED);
    }

    const account = await accountRepository.findById(payload.sub);
    if (!account) throw AppError.unauthorized('Account not found', ErrorCode.UNAUTHORIZED);

    const validTokens = await refreshTokenRepository.findValidByAccountId(account.id);
    let matched = false;
    for (const t of validTokens) {
      if (await compareToken(refreshToken, t.tokenHash)) {
        matched = true;
        break;
      }
    }
    if (!matched) throw AppError.unauthorized('Refresh token has been revoked', ErrorCode.TOKEN_INVALID);

    const accessToken = signAccessToken({ sub: account.id, email: account.email, role: account.role as Role });
    return { accessToken };
  },

  async forgotPassword(email: string) {
    const account = await accountRepository.findByEmail(email);
    if (!account) return { message: 'If that email exists, a reset code has been sent' }; // don't leak existence
    await createAndSendOtp(account.id, email, VerificationPurpose.PASSWORD_RESET);
    return { message: 'If that email exists, a reset code has been sent' };
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const account = await accountRepository.findByEmail(email);
    if (!account) throw AppError.badRequest('Invalid request');

    const verification = await verificationRepository.findLatestActive(account.id, VerificationPurpose.PASSWORD_RESET);
    if (!verification) throw AppError.badRequest('No active reset code. Please request a new one.', ErrorCode.OTP_EXPIRED);

    if (verification.attempts >= MAX_OTP_ATTEMPTS) {
      throw AppError.badRequest('Too many failed attempts. Please request a new code.', ErrorCode.OTP_INVALID);
    }

    const isValid = await compareToken(otp, verification.codeHash);
    if (!isValid) {
      await verificationRepository.incrementAttempts(verification.id);
      throw AppError.badRequest('Invalid reset code', ErrorCode.OTP_INVALID);
    }

    await verificationRepository.markConsumed(verification.id);
    const passwordHash = await hashPassword(newPassword);
    await accountRepository.updatePassword(account.id, passwordHash);
    await refreshTokenRepository.revokeAllForAccount(account.id);
    await emailService.sendPasswordResetConfirmation(email);
    await auditRepository.log('UPDATE', 'Account', account.id, account.id, { action: 'password_reset' });

    return { message: 'Password reset successfully. Please log in again.' };
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return { message: 'Logged out' };
    try {
      const payload = verifyRefreshToken(refreshToken);
      const validTokens = await refreshTokenRepository.findValidByAccountId(payload.sub);
      for (const t of validTokens) {
        if (await compareToken(refreshToken, t.tokenHash)) {
          await refreshTokenRepository.revoke(t.id);
          break;
        }
      }
    } catch {
      // token already invalid, nothing to do
    }
    return { message: 'Logged out' };
  }
};
