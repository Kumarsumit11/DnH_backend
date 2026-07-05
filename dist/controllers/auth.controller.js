"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const auth_service_1 = require("../services/auth.service");
const env_1 = require("../config/env");
const client_1 = require("@prisma/client");
const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: env_1.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
};
exports.authController = {
    registerInvestor: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password, fullName, phone, address } = req.body;
        const result = await auth_service_1.authService.registerInvestor(email, password, fullName, phone, address);
        (0, apiResponse_1.sendSuccess)(res, result, 'Registration successful. Please verify your email.', 201);
    }),
    registerCompany: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password, companyName, phone, address } = req.body;
        const result = await auth_service_1.authService.registerCompany(email, password, companyName, phone, address);
        (0, apiResponse_1.sendSuccess)(res, result, 'Registration successful. Please verify your email.', 201);
    }),
    verifyEmail: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, otp } = req.body;
        const result = await auth_service_1.authService.verifyEmail(email, otp);
        (0, apiResponse_1.sendSuccess)(res, result, 'Email verified successfully');
    }),
    resendOtp: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        const result = await auth_service_1.authService.resendOtp(email, client_1.VerificationPurpose.EMAIL_VERIFICATION);
        (0, apiResponse_1.sendSuccess)(res, result, 'OTP sent');
    }),
    login: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        const result = await auth_service_1.authService.login(email, password, req.headers['user-agent'], req.ip);
        res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);
        (0, apiResponse_1.sendSuccess)(res, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            account: result.account
        }, 'Login successful');
    }),
    refresh: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
        const result = await auth_service_1.authService.refreshAccessToken(refreshToken);
        (0, apiResponse_1.sendSuccess)(res, result, 'Access token refreshed');
    }),
    forgotPassword: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        const result = await auth_service_1.authService.forgotPassword(email);
        (0, apiResponse_1.sendSuccess)(res, result, result.message);
    }),
    resetPassword: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, otp, newPassword } = req.body;
        const result = await auth_service_1.authService.resetPassword(email, otp, newPassword);
        (0, apiResponse_1.sendSuccess)(res, result, result.message);
    }),
    logout: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
        const result = await auth_service_1.authService.logout(refreshToken);
        res.clearCookie('refreshToken', { path: '/api/auth' });
        (0, apiResponse_1.sendSuccess)(res, result, 'Logged out successfully');
    })
};
