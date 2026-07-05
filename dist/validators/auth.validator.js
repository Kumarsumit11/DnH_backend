"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProfileSchema = exports.registerStartSchema = exports.refreshTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendOtpSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerCompanySchema = exports.registerInvestorSchema = void 0;
const zod_1 = require("zod");
exports.registerInvestorSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        fullName: zod_1.z.string().min(2),
        phone: zod_1.z.string().min(7).optional(),
        address: zod_1.z.string().optional()
    })
});
exports.registerCompanySchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        companyName: zod_1.z.string().min(2),
        phone: zod_1.z.string().min(7).optional(),
        address: zod_1.z.string().optional()
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1)
    })
});
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        otp: zod_1.z.string().length(6)
    })
});
exports.resendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email()
    })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email()
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        otp: zod_1.z.string().length(6),
        newPassword: zod_1.z.string().min(8)
    })
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(10).optional()
    })
});
exports.registerStartSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        role: zod_1.z.enum(["INVESTOR", "COMPANY"]),
    }),
});
exports.completeProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        fullName: zod_1.z.string().optional(),
        companyName: zod_1.z.string().optional(),
        phone: zod_1.z.string(),
        address: zod_1.z.string().optional(),
    }),
});
