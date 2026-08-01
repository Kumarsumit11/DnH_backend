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
 * Upsert a batch of indicator values for a submission.
 *
 * Uses the array form of $transaction (a list of prepared queries) rather
 * than the callback form with sequential awaited findFirst/create/update
 * calls per value. The callback form holds an interactive transaction open
 * across N round-trips to the DB, which on a slow/pooled connection (Render)
 * can exceed Prisma's default 5s transaction timeout and fail with
 * "Transaction not found" partway through. The array form sends every
 * upsert as one batched request, so it can't time out mid-loop the same way.
 */
export async function upsertValues(
  monthlySubmissionId: string,
  values: IndicatorValueInput[]
): Promise<IndicatorValueRow[]> {
  if (values.length > 0) {
    // Prisma can't do a compound-unique upsert when one of the unique
    // columns (productId) is nullable — SQL treats NULL != NULL, so
    // Prisma doesn't generate a where-unique type that accepts null there.
    // Instead: fetch existing rows for this submission once, decide
    // create-vs-update per value in app code, then batch everything into
    // one $transaction array (still a single round trip, still no
    // interactive-transaction timeout risk).
    const existing = await prisma.indicatorValue.findMany({
      where: { monthlySubmissionId },
      select: { id: true, indicatorDefinitionId: true, productId: true, valueType: true },
    });

    const keyOf = (indicatorDefinitionId: string, productId: string | null, valueType: string) =>
      `${indicatorDefinitionId}|${productId ?? ''}|${valueType}`;

    const existingByKey = new Map(
      existing.map((row) => [keyOf(row.indicatorDefinitionId, row.productId, row.valueType), row.id])
    );

    const ops = values.map((v) => {
      const productId: string | null = v.productId ?? null;
      const key = keyOf(v.indicatorDefinitionId, productId, v.valueType);
      const existingId = existingByKey.get(key);

      if (existingId) {
        return prisma.indicatorValue.update({
          where: { id: existingId },
          data: { value: v.value },
        });
      }

      return prisma.indicatorValue.create({
        data: {
          monthlySubmissionId,
          indicatorDefinitionId: v.indicatorDefinitionId,
          productId,
          valueType: v.valueType,
          value: v.value,
        },
      });
    });

    await prisma.$transaction(ops);
  }

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