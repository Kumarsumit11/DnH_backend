import { z } from 'zod';

export const updateInvestorProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    address: z.string().optional(),
    investmentRangeMin: z.number().nonnegative().optional(),
    investmentRangeMax: z.number().nonnegative().optional(),
    preferredIndustries: z.array(z.string()).optional(),
    bio: z.string().optional()
  })
});

export const browseCompaniesQuerySchema = z.object({
  query: z.object({
    industry: z.string().optional(),
    minFund: z.string().optional(),
    maxFund: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});
