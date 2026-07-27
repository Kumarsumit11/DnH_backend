import { PrismaClient } from '@prisma/client';
import type { DashboardScope, IndicatorDefinitionRow } from '../types/tally';

const prisma = new PrismaClient();

/** dashboardScope: 'CEO' | 'CFO' | undefined (undefined = all) */
export async function list(
  dashboardScope?: DashboardScope
): Promise<IndicatorDefinitionRow[]> {
  return prisma.indicatorDefinition.findMany({
    where: dashboardScope
      ? {
          OR: [
            { dashboardScope },
            { dashboardScope: 'BOTH' },
          ],
        }
      : undefined,
    orderBy: {
      sortOrder: 'asc',
    },
  });
}

export async function getByCode(
  code: string
): Promise<IndicatorDefinitionRow | null> {
  return prisma.indicatorDefinition.findUnique({
    where: {
      code,
    },
  });
}

export default {
  list,
  getByCode,
};