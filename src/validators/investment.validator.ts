import { z } from 'zod';

export const createProposalSchema = z.object({
  body: z.object({
    fundingOpportunityId: z.string().uuid(),
    proposedAmount: z.number().positive(),
    message: z.string().optional()
  })
});

export const proposalStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'])
  })
});
