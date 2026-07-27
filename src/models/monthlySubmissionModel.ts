import { PrismaClient } from '@prisma/client';
import type {
  IndicatorValueInput,
  IndicatorValueRow,
  Month,
  MonthlySubmissionRow,
} from '../types/tally';

const prisma = new PrismaClient();

export async function getSubmission(
  fiscalYearConfigId: string,
  month: Month
): Promise<MonthlySubmissionRow | null> {
  return prisma.monthlySubmission.findUnique({
    where: {
      fiscalYearConfigId_month: {
        fiscalYearConfigId,
        month,
      },
    },
  });
}

export async function getOrCreateDraft(
  fiscalYearConfigId: string,
  month: Month
): Promise<MonthlySubmissionRow> {
  const existing = await getSubmission(fiscalYearConfigId, month);
  
  if (existing) {
    return existing;
  }
  
  return prisma.monthlySubmission.create({
    data: {
      fiscalYearConfigId,
      month,
      status: 'DRAFT',
    },
  });
}

export async function getValues(
  monthlySubmissionId: string
): Promise<IndicatorValueRow[]> {
  const values = await prisma.indicatorValue.findMany({
    where: {
      monthlySubmissionId,
    },
    include: {
      indicatorDefinition: true,
    },
  });

  return values.map((v) => ({
    id: v.id,
    monthlySubmissionId: v.monthlySubmissionId,
    indicatorDefinitionId: v.indicatorDefinitionId,
    productId: v.productId,
    valueType: v.valueType,
    value: Number(v.value),
    indicatorCode: v.indicatorDefinition.code,
  }));
}

/**
 * Upsert a batch of indicator values for a submission inside a transaction.
 */
export async function upsertValues(
  monthlySubmissionId: string,
  values: IndicatorValueInput[]
): Promise<IndicatorValueRow[]> {
  await prisma.$transaction(async (tx) => {
    for (const v of values) {
      const existing = await tx.indicatorValue.findFirst({
        where: {
          monthlySubmissionId,
          indicatorDefinitionId: v.indicatorDefinitionId,
          productId: v.productId ?? null,
          valueType: v.valueType,
        },
      });

      if (existing) {
        await tx.indicatorValue.update({
          where: { id: existing.id },
          data: { value: v.value },
        });
      } else {
        await tx.indicatorValue.create({
          data: {
            monthlySubmissionId,
            indicatorDefinitionId: v.indicatorDefinitionId,
            productId: v.productId ?? null,
            valueType: v.valueType,
            value: v.value,
          },
        });
      }
    }
  });

  // updatedAt is automatically handled by Prisma's @updatedAt attribute
  // No need to manually update it

  return getValues(monthlySubmissionId);
}

export async function markSubmitted(
  monthlySubmissionId: string,
  submittedBy?: string | null
): Promise<MonthlySubmissionRow> {
  return prisma.monthlySubmission.update({
    where: {
      id: monthlySubmissionId,
    },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      submittedById: submittedBy ?? null,
    },
  });
}

export default {
  getSubmission,
  getOrCreateDraft,
  getValues,
  upsertValues,
  markSubmitted,
};