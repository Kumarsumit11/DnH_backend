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
    address: z.string().optional()
  })
});
