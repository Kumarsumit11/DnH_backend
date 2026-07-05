import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { authService } from '../services/auth.service';
import { env } from '../config/env';
import { VerificationPurpose } from '@prisma/client';

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth'
};

export const authController = {
  registerInvestor: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, phone, address } = req.body;
    const result = await authService.registerInvestor(email, password, fullName, phone, address);
    sendSuccess(res, result, 'Registration successful. Please verify your email.', 201);
  }),

  registerCompany: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, companyName, phone, address } = req.body;
    const result = await authService.registerCompany(email, password, companyName, phone, address);
    sendSuccess(res, result, 'Registration successful. Please verify your email.', 201);
  }),

   


  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    sendSuccess(res, result, 'Email verified successfully');
  }),

  resendOtp: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendOtp(email, VerificationPurpose.EMAIL_VERIFICATION);
    sendSuccess(res, result, 'OTP sent');
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password, req.headers['user-agent'], req.ip);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);
    sendSuccess(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      account: result.account
    }, 'Login successful');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Access token refreshed');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result, result.message);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    sendSuccess(res, result, result.message);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const result = await authService.logout(refreshToken);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    sendSuccess(res, result, 'Logged out successfully');
  })
};
