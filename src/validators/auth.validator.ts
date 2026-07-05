import { z } from 'zod';

export const registerInvestorSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2),
    phone: z.string().min(7).optional(),
    address: z.string().optional()
  })
});

export const registerCompanySchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    companyName: z.string().min(2),
    phone: z.string().min(7).optional(),
    address: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6)
  })
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8)
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10).optional()
  })
});

export const registerStartSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["INVESTOR", "COMPANY"]),
  }),
});

export const completeProfileSchema = z.object({
  body: z.object({
    email: z.string().email(),
    fullName: z.string().optional(),
    companyName: z.string().optional(),
    phone: z.string(),
    address: z.string().optional(),
  }),
});