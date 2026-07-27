import { Prisma } from "@prisma/client";

/**
 * types.ts — shared domain types for the backend half of the Tally form.
 * Mirrors migrations/001_create_tally_schema.sql; keep both in sync.
 */

export type DashboardScope = 'CEO' | 'CFO' | 'BOTH';
export type DataType = 'CURRENCY' | 'PERCENT' | 'DAYS' | 'COUNT' | 'RATIO';
export type CalculationType = 'SUM' | 'AVERAGE' | 'LAST_VALUE';
export type ValueType = 'ACTUAL' | 'TARGET' | 'LAST_YEAR';
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED';
export type Month = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC';

/** Row shape from `indicator_definitions`. */
export interface IndicatorDefinitionRow {
  id: string;
  code: string;
  label: string;
  dashboardScope: DashboardScope;
  dataType: DataType;
  calculationType: CalculationType;
  hasTarget: boolean;
  hasLastYear: boolean;
  isFormula: boolean;
  formulaKey: string | null;
  allowNegative: boolean;
  sortOrder: number;
}

/** Row shape from `fiscal_year_configs`. */
export interface FiscalYearConfigRow {
  id: string;
  companyId: string;
  fiscalYearLabel: string;
  startMonth: Month;
  targetGreenThreshold: Prisma.Decimal;
  targetAmberThreshold: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}

/** Row shape from `products`. */
export interface ProductRow {
  id: string;
  fiscalYearConfigId: string;
  slot: number;
  name: string | null;
}

/** Row shape from `monthly_submissions`. */
export interface MonthlySubmissionRow {
  id: string;
  fiscalYearConfigId: string;
  month: Month;
  status: SubmissionStatus;
  submittedAt: Date | null;
  submittedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Row shape from the `indicator_values` JOIN `indicator_definitions` query. */
export interface IndicatorValueRow {
  id: string;
  monthlySubmissionId: string;
  indicatorDefinitionId: string;
  productId: string | null;
  valueType: ValueType;
  value: number;
  indicatorCode: string;
}

/** A single value the client wants to write for one indicator/product/type. */
export interface IndicatorValueInput {
  indicatorDefinitionId: string;
  productId?: string | null;
  valueType: ValueType;
  value: number;
}

/** { field, message } — used both for validation errors and reconciliation warnings. */
export interface FieldMessage {
  field: string;
  message: string;
}

export interface ProductInput {
  slot: number;
  name?: string | null;
}

export interface UpsertFiscalYearConfigInput {
  companyId: string;
  fiscalYearLabel: string;
  startMonth: Month;
  targetGreenThreshold?: number;
  targetAmberThreshold?: number;
}