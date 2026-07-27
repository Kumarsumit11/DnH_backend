/**
 * validationService.ts
 *
 * Server-side validation — the last line of defense even though the form
 * validates the same rules client-side. Never trust the client.
 */

import type { FieldMessage, IndicatorDefinitionRow, Month, ValueType } from '../types/tally';

export const MONTHS: Month[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export class ValidationError extends Error {
  errors: FieldMessage[];

  constructor(errors: FieldMessage[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

function isNumeric(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Validate one submitted indicator value against its definition.
 */
export function validateIndicatorValue(
  indicatorDef: IndicatorDefinitionRow,
  value: unknown,
  valueType: ValueType
): FieldMessage[] {
  const errors: FieldMessage[] = [];
  const field = `${indicatorDef.code}.${valueType}`;

  // 1. Formula fields must never be submitted as input.
  if (indicatorDef.isFormula) {
    errors.push({ field, message: `${indicatorDef.label} is a calculated field and cannot be submitted directly.` });
    return errors;
  }

  // 2. Required — every ACTUAL value is required; TARGET/LAST_YEAR required
  //    only when the indicator defines hasTarget / hasLastYear.
  if (value === null || value === undefined || value === '') {
    if (
      valueType === 'ACTUAL' ||
      (valueType === 'TARGET' && indicatorDef.hasTarget) ||
      (valueType === 'LAST_YEAR' && indicatorDef.hasLastYear)
    ) {
      errors.push({ field, message: `${indicatorDef.label} (${valueType}) is required.` });
    }
    return errors; // nothing further to check on an absent value
  }

  // 3. Numeric.
  if (!isNumeric(value)) {
    errors.push({ field, message: `${indicatorDef.label} must be a number.` });
    return errors;
  }

  // 4. Type-specific range checks.
  switch (indicatorDef.dataType) {
    case 'PERCENT':
      // Stored as a fraction (0.10 = 10%), matching the workbook's own convention.
      if (value < -5 || value > 5) {
        errors.push({ field, message: `${indicatorDef.label} looks out of range for a percentage.` });
      }
      break;
    case 'DAYS':
      if (value < 0) {
        errors.push({ field, message: `${indicatorDef.label} cannot be negative.` });
      }
      break;
    case 'COUNT':
      if (value < 0 || !Number.isInteger(value)) {
        errors.push({ field, message: `${indicatorDef.label} must be a non-negative whole number.` });
      }
      break;
    case 'CURRENCY':
    case 'RATIO':
      if (!indicatorDef.allowNegative && value < 0) {
        errors.push({ field, message: `${indicatorDef.label} cannot be negative.` });
      }
      break;
    default:
      break;
  }

  return errors;
}

export interface SubmissionValueEntry {
  indicatorCode: string;
  valueType: ValueType;
  value: unknown;
}

export interface SubmissionPayload {
  month: string;
  values?: SubmissionValueEntry[];
}

/**
 * Validate a full submission payload before allowing POST /submit.
 * definitions: array of indicator_definitions rows relevant to this dashboard scope
 */
export function validateSubmission(definitions: IndicatorDefinitionRow[], payload: SubmissionPayload): void {
  const errors: FieldMessage[] = [];
  const byCode = Object.fromEntries(definitions.map((d) => [d.code, d]));

  for (const entry of payload.values || []) {
    const def = byCode[entry.indicatorCode];
    if (!def) {
      errors.push({ field: entry.indicatorCode, message: `Unknown indicator code "${entry.indicatorCode}".` });
      continue;
    }
    errors.push(...validateIndicatorValue(def, entry.value, entry.valueType));
  }

  if (!MONTHS.includes(payload.month as Month)) {
    errors.push({ field: 'month', message: 'Invalid month.' });
  }

  if (errors.length) {
    throw new ValidationError(errors);
  }
}