// company.validator.ts
import { z } from 'zod';

const informationMemoSchema = z.object({
  borrower: z.string().optional(),
  promoters: z.string().optional(),
  coBorrowerGuarantor: z.string().optional(),
  aboutBorrowingEntity: z.string().optional(),
  registeredAddress: z.string().optional(),
  corporateOffice: z.string().optional(),
  aboutGroup: z.string().optional(),
  aboutPromoter: z.string().optional(),
  shareholdingPattern: z.string().optional(),
  directorsProfile: z.string().optional(),
  financials: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  repaymentHistory: z.string().optional(),
  expansionPlan: z.string().optional(),
  employeeStrength: z.string().optional(),
  industryOverview: z.string().optional(),
  topCustomers: z.string().optional(),
  currentBankingArrangement: z.string().optional(),
  proposedTransaction: z.string().optional(),
  proposedBankingArrangement: z.string().optional(),
  collateralSecurity: z.string().optional(),
  otherSecurity: z.string().optional(),
  swotAnalysis: z.string().optional(),
});

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
    informationMemo: informationMemoSchema.optional(), // ← new
  })
});