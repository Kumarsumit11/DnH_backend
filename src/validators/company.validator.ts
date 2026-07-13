import { z } from 'zod';

export const updateCompanyProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).optional(),
    registrationNumber: z.string().optional(),
    industry: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    teamSize: z.number().int().min(1).optional(),
    address: z.string().optional(),
    gstin: z.string()
      .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format')
      .optional(),
    ceoName: z.string().min(2).max(100).optional(),
    cfoName: z.string().min(2).max(100).optional(),
    monthlyRevenue: z.coerce.number().nonnegative().optional(),
    yearlyRevenue: z.coerce.number().nonnegative().optional(),
  })
});
