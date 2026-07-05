import { z } from 'zod';

export const createFundingSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    fundNeeded: z.number().positive(),
    fundPurpose: z.string().min(3),
    valuation: z.number().positive().optional(),
    minimumTicket: z.number().positive().optional(),
    equityOfferedPct: z.number().min(0).max(100).optional()
  })
});

export const updateFundingSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    fundNeeded: z.number().positive().optional(),
    fundPurpose: z.string().min(3).optional(),
    valuation: z.number().positive().optional(),
    minimumTicket: z.number().positive().optional(),
    equityOfferedPct: z.number().min(0).max(100).optional()
  })
});

export const fundingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'REJECTED', 'CLOSED']),
    rejectionReason: z.string().optional()
  })
});
