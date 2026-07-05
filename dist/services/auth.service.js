"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const account_repository_1 = require("../repositories/account.repository");
const verification_repository_1 = require("../repositories/verification.repository");
const refreshToken_repository_1 = require("../repositories/refreshToken.repository");
const hash_1 = require("../utils/hash");
const otp_1 = require("../utils/otp");
const jwt_1 = require("../utils/jwt");
const email_service_1 = require("../emails/email.service");
const AppError_1 = require("../errors/AppError");
const errorCodes_1 = require("../constants/errorCodes");
const client_1 = require("@prisma/client");
const audit_repository_1 = require("../repositories/audit.repository");
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
async function createAndSendOtp(accountId, email, purpose) {
    await verification_repository_1.verificationRepository.invalidateAllForPurpose(accountId, purpose);
    const otp = (0, otp_1.generateOtp)(6);
    const codeHash = await (0, hash_1.hashToken)(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await verification_repository_1.verificationRepository.create(accountId, purpose, codeHash, expiresAt);
    const purposeLabel = purpose === client_1.VerificationPurpose.EMAIL_VERIFICATION ? 'email verification' : 'password reset';
    await email_service_1.emailService.sendOtpEmail(email, otp, purposeLabel);
}
async function issueTokens(accountId, email, role, userAgent, ipAddress) {
    const accessToken = (0, jwt_1.signAccessToken)({ sub: accountId, email, role });
    const refreshToken = (0, jwt_1.signRefreshToken)({ sub: accountId });
    const tokenHash = await (0, hash_1.hashToken)(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await refreshToken_repository_1.refreshTokenRepository.create(accountId, tokenHash, expiresAt, userAgent, ipAddress);
    return { accessToken, refreshToken };
}
exports.authService = {
    async registerInvestor(email, password, fullName, phone, address) {
        const existing = await account_repository_1.accountRepository.findByEmail(email);
        if (existing)
            throw AppError_1.AppError.conflict('An account with this email already exists', errorCodes_1.ErrorCode.CONFLICT);
        const passwordHash = await (0, hash_1.hashPassword)(password);
        const account = await account_repository_1.accountRepository.createInvestor(email, passwordHash, fullName, phone, address);
        await createAndSendOtp(account.id, email, client_1.VerificationPurpose.EMAIL_VERIFICATION);
        await audit_repository_1.auditRepository.log('CREATE', 'Account', account.id, account.id, { role: 'INVESTOR' });
        return { id: account.id, email: account.email, role: account.role };
    },
    async registerCompany(email, password, companyName, phone, address) {
        const existing = await account_repository_1.accountRepository.findByEmail(email);
        if (existing)
            throw AppError_1.AppError.conflict('An account with this email already exists', errorCodes_1.ErrorCode.CONFLICT);
        const passwordHash = await (0, hash_1.hashPassword)(password);
        const account = await account_repository_1.accountRepository.createCompany(email, passwordHash, companyName, phone, address);
        await createAndSendOtp(account.id, email, client_1.VerificationPurpose.EMAIL_VERIFICATION);
        await audit_repository_1.auditRepository.log('CREATE', 'Account', account.id, account.id, { role: 'COMPANY' });
        return { id: account.id, email: account.email, role: account.role };
    },
    async verifyEmail(email, otp) {
        const account = await account_repository_1.accountRepository.findByEmail(email);
        if (!account)
            throw AppError_1.AppError.notFound('Account not found');
        if (account.isEmailVerified)
            throw AppError_1.AppError.badRequest('Email already verified');
        const verification = await verification_repository_1.verificationRepository.findLatestActive(account.id, client_1.VerificationPurpose.EMAIL_VERIFICATION);
        if (!verification)
            throw AppError_1.AppError.badRequest('No active verification code. Please request a new one.', errorCodes_1.ErrorCode.OTP_EXPIRED);
        if (verification.attempts >= MAX_OTP_ATTEMPTS) {
            throw AppError_1.AppError.badRequest('Too many failed attempts. Please request a new code.', errorCodes_1.ErrorCode.OTP_INVALID);
        }
        const isValid = await (0, hash_1.compareToken)(otp, verification.codeHash);
        if (!isValid) {
            await verification_repository_1.verificationRepository.incrementAttempts(verification.id);
            throw AppError_1.AppError.badRequest('Invalid verification code', errorCodes_1.ErrorCode.OTP_INVALID);
        }
        await verification_repository_1.verificationRepository.markConsumed(verification.id);
        await account_repository_1.accountRepository.markEmailVerified(account.id);
        const name = account.investorProfile?.fullName || account.companyProfile?.companyName || 'there';
        await email_service_1.emailService.sendWelcomeEmail(email, name);
        await audit_repository_1.auditRepository.log('UPDATE', 'Account', account.id, account.id, { action: 'email_verified' });
        return { message: 'Email verified successfully' };
    },
    async resendOtp(email, purpose = client_1.VerificationPurpose.EMAIL_VERIFICATION) {
        const account = await account_repository_1.accountRepository.findByEmail(email);
        if (!account)
            throw AppError_1.AppError.notFound('Account not found');
        if (purpose === client_1.VerificationPurpose.EMAIL_VERIFICATION && account.isEmailVerified) {
            throw AppError_1.AppError.badRequest('Email already verified');
        }
        await createAndSendOtp(account.id, email, purpose);
        return { message: 'Verification code sent' };
    },
    async login(email, password, userAgent, ipAddress) {
        const account = await account_repository_1.accountRepository.findByEmail(email);
        if (!account)
            throw AppError_1.AppError.unauthorized('Invalid email or password', errorCodes_1.ErrorCode.INVALID_CREDENTIALS);
        const isValid = await (0, hash_1.comparePassword)(password, account.passwordHash);
        if (!isValid)
            throw AppError_1.AppError.unauthorized('Invalid email or password', errorCodes_1.ErrorCode.INVALID_CREDENTIALS);
        if (!account.isEmailVerified) {
            throw AppError_1.AppError.forbidden('Please verify your email before logging in', errorCodes_1.ErrorCode.EMAIL_NOT_VERIFIED);
        }
        if (account.status === client_1.AccountStatus.SUSPENDED) {
            throw AppError_1.AppError.forbidden('Your account has been suspended. Contact support.', errorCodes_1.ErrorCode.FORBIDDEN);
        }
        if (account.status === client_1.AccountStatus.DEACTIVATED) {
            throw AppError_1.AppError.forbidden('Your account has been deactivated.', errorCodes_1.ErrorCode.FORBIDDEN);
        }
        const tokens = await issueTokens(account.id, account.email, account.role, userAgent, ipAddress);
        await audit_repository_1.auditRepository.log('LOGIN', 'Account', account.id, account.id, undefined, ipAddress);
        return {
            ...tokens,
            account: { id: account.id, email: account.email, role: account.role, status: account.status }
        };
    },
    async refreshAccessToken(refreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw AppError_1.AppError.unauthorized('Invalid or expired refresh token', errorCodes_1.ErrorCode.TOKEN_EXPIRED);
        }
        const account = await account_repository_1.accountRepository.findById(payload.sub);
        if (!account)
            throw AppError_1.AppError.unauthorized('Account not found', errorCodes_1.ErrorCode.UNAUTHORIZED);
        const validTokens = await refreshToken_repository_1.refreshTokenRepository.findValidByAccountId(account.id);
        let matched = false;
        for (const t of validTokens) {
            if (await (0, hash_1.compareToken)(refreshToken, t.tokenHash)) {
                matched = true;
                break;
            }
        }
        if (!matched)
            throw AppError_1.AppError.unauthorized('Refresh token has been revoked', errorCodes_1.ErrorCode.TOKEN_INVALID);
        const accessToken = (0, jwt_1.signAccessToken)({ sub: account.id, email: account.email, role: account.role });
        return { accessToken };
    },
    async forgotPassword(email) {
        const account = await account_repository_1.accountRepository.findByEmail(email);
        if (!account)
            return { message: 'If that email exists, a reset code has been sent' }; // don't leak existence
        await createAndSendOtp(account.id, email, client_1.VerificationPurpose.PASSWORD_RESET);
        return { message: 'If that email exists, a reset code has been sent' };
    },
    async resetPassword(email, otp, newPassword) {
        const account = await account_repository_1.accountRepository.findByEmail(email);
        if (!account)
            throw AppError_1.AppError.badRequest('Invalid request');
        const verification = await verification_repository_1.verificationRepository.findLatestActive(account.id, client_1.VerificationPurpose.PASSWORD_RESET);
        if (!verification)
            throw AppError_1.AppError.badRequest('No active reset code. Please request a new one.', errorCodes_1.ErrorCode.OTP_EXPIRED);
        if (verification.attempts >= MAX_OTP_ATTEMPTS) {
            throw AppError_1.AppError.badRequest('Too many failed attempts. Please request a new code.', errorCodes_1.ErrorCode.OTP_INVALID);
        }
        const isValid = await (0, hash_1.compareToken)(otp, verification.codeHash);
        if (!isValid) {
            await verification_repository_1.verificationRepository.incrementAttempts(verification.id);
            throw AppError_1.AppError.badRequest('Invalid reset code', errorCodes_1.ErrorCode.OTP_INVALID);
        }
        await verification_repository_1.verificationRepository.markConsumed(verification.id);
        const passwordHash = await (0, hash_1.hashPassword)(newPassword);
        await account_repository_1.accountRepository.updatePassword(account.id, passwordHash);
        await refreshToken_repository_1.refreshTokenRepository.revokeAllForAccount(account.id);
        await email_service_1.emailService.sendPasswordResetConfirmation(email);
        await audit_repository_1.auditRepository.log('UPDATE', 'Account', account.id, account.id, { action: 'password_reset' });
        return { message: 'Password reset successfully. Please log in again.' };
    },
    async logout(refreshToken) {
        if (!refreshToken)
            return { message: 'Logged out' };
        try {
            const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const validTokens = await refreshToken_repository_1.refreshTokenRepository.findValidByAccountId(payload.sub);
            for (const t of validTokens) {
                if (await (0, hash_1.compareToken)(refreshToken, t.tokenHash)) {
                    await refreshToken_repository_1.refreshTokenRepository.revoke(t.id);
                    break;
                }
            }
        }
        catch {
            // token already invalid, nothing to do
        }
        return { message: 'Logged out' };
    }
};
