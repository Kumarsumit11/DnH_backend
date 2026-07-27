import { PrismaClient } from '@prisma/client';
import type {
  FiscalYearConfigRow,
  Month,
  ProductInput,
  ProductRow,
  UpsertFiscalYearConfigInput,
} from '../types/tally';

const prisma = new PrismaClient();

export async function getByCompany(
  companyId: string,
  fiscalYearLabel: string
): Promise<FiscalYearConfigRow | null> {
  return prisma.fiscalYearConfig.findUnique({
    where: {
      companyId_fiscalYearLabel: {
        companyId,
        fiscalYearLabel,
      },
    },
  });
}

export async function listByCompany(
  companyId: string
): Promise<FiscalYearConfigRow[]> {
  return prisma.fiscalYearConfig.findMany({
    where: {
      companyId,
    },
    orderBy: {
      fiscalYearLabel: 'desc',
    },
  });
}

export async function upsert({
  companyId,
  fiscalYearLabel,
  startMonth,
  targetGreenThreshold,
  targetAmberThreshold,
}: UpsertFiscalYearConfigInput): Promise<FiscalYearConfigRow> {
  return prisma.fiscalYearConfig.upsert({
    where: {
      companyId_fiscalYearLabel: {
        companyId,
        fiscalYearLabel,
      },
    },

    update: {
      startMonth,
      ...(targetGreenThreshold !== undefined && {
        targetGreenThreshold,
      }),
      ...(targetAmberThreshold !== undefined && {
        targetAmberThreshold,
      }),
    },

    create: {
      companyId,
      fiscalYearLabel,
      startMonth,
      ...(targetGreenThreshold !== undefined && {
        targetGreenThreshold,
      }),
      ...(targetAmberThreshold !== undefined && {
        targetAmberThreshold,
      }),
    },
  });
}

export async function getProducts(
  fiscalYearConfigId: string
): Promise<ProductRow[]> {
  return prisma.product.findMany({
    where: {
      fiscalYearConfigId,
    },
    orderBy: {
      slot: 'asc',
    },
  });
}

export async function upsertProducts(
  fiscalYearConfigId: string,
  products: ProductInput[]
): Promise<ProductRow[]> {
  await prisma.$transaction(
    products.map((product) =>
      prisma.product.upsert({
        where: {
          fiscalYearConfigId_slot: {
            fiscalYearConfigId,
            slot: product.slot,
          },
        },

        update: {
          name: product.name || null,
        },

        create: {
          fiscalYearConfigId,
          slot: product.slot,
          name: product.name || null,
        },
      })
    )
  );

  return prisma.product.findMany({
    where: {
      fiscalYearConfigId,
    },
    orderBy: {
      slot: 'asc',
    },
  });
}

/** Generates the 12 fiscal month labels in order, starting from start_month —
 *  mirrors the chained IF() formulas in Data!G5:Q5 of both workbooks. */
export function fiscalMonthOrder(startMonth: Month): Month[] {
  const MONTHS: Month[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const startIdx = MONTHS.indexOf(startMonth);
  if (startIdx === -1) throw new Error(`Invalid start month: ${startMonth}`);
  return Array.from({ length: 12 }, (_, i) => MONTHS[(startIdx + i) % 12]);
}

export default { getByCompany, listByCompany, upsert, getProducts, upsertProducts, fiscalMonthOrder };