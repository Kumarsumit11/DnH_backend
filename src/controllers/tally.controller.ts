import type { NextFunction, Request, Response } from 'express';
import fyModel from '../models/fiscalYearConfigModel';
import indicatorModel from '../models/indicatorDefinitionModel';
import submissionModel from '../models/monthlySubmissionModel';
import { recalculateMonth } from '../services/recalculateMonth.service';
import type { RawCalcInput } from '../services/recalculateMonth.service';
import { ValidationError, validateSubmission } from '../services/validation.service';
import type { DashboardScope, IndicatorDefinitionRow, IndicatorValueInput, IndicatorValueRow, Month, ProductInput } from '../types/tally';

/** Wire shape sent to the frontend — matches frontend/types/tally.ts IndicatorDefinition. */
interface IndicatorDefinitionWire {
  code: string;
  label: string;
  data_type: string;
  has_target: boolean;
  has_last_year: boolean;
  is_formula: boolean;
  dashboard_scope: string;
}

/** Converts backend camelCase IndicatorDefinitionRow (from Prisma) into the
 *  snake_case shape the frontend's types/tally.ts expects on the wire. */
function toWireIndicatorDefinition(d: IndicatorDefinitionRow): IndicatorDefinitionWire {
  return {
    code: d.code,
    label: d.label,
    data_type: d.dataType,
    has_target: d.hasTarget,
    has_last_year: d.hasLastYear,
    is_formula: d.isFormula,
    dashboard_scope: d.dashboardScope,
  };
}

/** GET /api/tally/config/:companyId?fiscalYear=2024-25 */
async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId } = req.params;
    const { fiscalYear, dashboardScope } = req.query as { fiscalYear?: string; dashboardScope?: DashboardScope };

    const definitions = (await indicatorModel.list(dashboardScope)).map(toWireIndicatorDefinition);

    if (!fiscalYear) {
      const configs = await fyModel.listByCompany(companyId);
      res.json({ fiscalYearConfigs: configs, indicatorDefinitions: definitions });
      return;
    }

    const config = await fyModel.getByCompany(companyId, fiscalYear);
    const products = config ? await fyModel.getProducts(config.id) : [];
    const monthOrder = config ? fyModel.fiscalMonthOrder(config.startMonth) : null;

    res.json({ fiscalYearConfig: config, products, monthOrder, indicatorDefinitions: definitions });
  } catch (err) {
    next(err);
  }
}

interface SaveConfigBody {
  fiscalYearLabel: string;
  startMonth: Month;
  targetGreenThreshold?: number;
  targetAmberThreshold?: number;
  products?: ProductInput[];
}

/** POST /api/tally/config/:companyId — the "ask once" endpoint */
async function saveConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId } = req.params;
    const { fiscalYearLabel, startMonth, targetGreenThreshold, targetAmberThreshold, products } =
      req.body as SaveConfigBody;

    const config = await fyModel.upsert({
      companyId,
      fiscalYearLabel,
      startMonth,
      targetGreenThreshold,
      targetAmberThreshold,
    });

    let savedProducts: Awaited<ReturnType<typeof fyModel.getProducts>> = [];
    if (Array.isArray(products) && products.length) {
      savedProducts = await fyModel.upsertProducts(config.id, products);
    }

    res.json({ fiscalYearConfig: config, products: savedProducts });
  } catch (err) {
    next(err);
  }
}

/** GET /api/tally/:companyId/:fiscalYear/:month */
async function getMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId, fiscalYear, month } = req.params as { companyId: string; fiscalYear: string; month: Month };
    const config = await fyModel.getByCompany(companyId, fiscalYear);
    if (!config) {
      res.status(404).json({ error: 'Fiscal year config not found. Save config first.' });
      return;
    }

    const submission = await submissionModel.getSubmission(config.id, month);
    if (!submission) {
      res.json({ submission: null, values: [], status: 'NOT_STARTED' });
      return;
    }
    const values = await submissionModel.getValues(submission.id);
    res.json({ submission, values });
  } catch (err) {
    next(err);
  }
}

interface SaveDraftBody {
  companyId: string;
  fiscalYear: string;
  month: Month;
  values: IndicatorValueInput[];
}

/** POST /api/tally/save-draft */
async function saveDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId, fiscalYear, month, values } = req.body as SaveDraftBody;
    const config = await fyModel.getByCompany(companyId, fiscalYear);
    if (!config) {
      res.status(404).json({ error: 'Fiscal year config not found. Save config first.' });
      return;
    }

    const submission = await submissionModel.getOrCreateDraft(config.id, month);
    const saved = await submissionModel.upsertValues(submission.id, values);

    res.json({ submission, values: saved, status: 'DRAFT' });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/tally/:companyId/:fiscalYear/:month — same upsert path as draft save */
async function updateMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId, fiscalYear, month } = req.params as { companyId: string; fiscalYear: string; month: Month };
    const { values } = req.body as { values: IndicatorValueInput[] };
    const config = await fyModel.getByCompany(companyId, fiscalYear);
    if (!config) {
      res.status(404).json({ error: 'Fiscal year config not found.' });
      return;
    }

    const submission = await submissionModel.getOrCreateDraft(config.id, month);
    const saved = await submissionModel.upsertValues(submission.id, values);

    res.json({ submission, values: saved });
  } catch (err) {
    next(err);
  }
}

interface SubmitBody {
  companyId: string;
  fiscalYear: string;
  month: Month;
  dashboardScope: DashboardScope;
  submittedBy?: string;
}

/** POST /api/tally/submit */
async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId, fiscalYear, month, dashboardScope, submittedBy } = req.body as SubmitBody;
    const config = await fyModel.getByCompany(companyId, fiscalYear);
    if (!config) {
      res.status(404).json({ error: 'Fiscal year config not found.' });
      return;
    }

    const definitions = await indicatorModel.list(dashboardScope);
    const submission = await submissionModel.getSubmission(config.id, month);
    if (!submission) {
      res.status(404).json({ error: 'No draft found for this month.' });
      return;
    }

    const rawValues = await submissionModel.getValues(submission.id);

    // Re-validate everything server-side before flipping to SUBMITTED.
    validateSubmission(definitions, {
      month,
      values: rawValues.map((v) => ({
        indicatorCode: v.indicatorCode,
        valueType: v.valueType,
        value: Number(v.value),
      })),
    });

    const updated = await submissionModel.markSubmitted(submission.id, submittedBy);
    res.json({ submission: updated, status: 'SUBMITTED' });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(422).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

/** GET /api/tally/calculations?companyId=&fiscalYear=&month= */
async function getCalculations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyId, fiscalYear, month } = req.query as { companyId: string; fiscalYear: string; month: Month };
    const config = await fyModel.getByCompany(companyId, fiscalYear);
    if (!config) {
      res.status(404).json({ error: 'Fiscal year config not found.' });
      return;
    }

    const submission = await submissionModel.getSubmission(config.id, month);
    if (!submission) {
      res.json({ results: {}, warnings: [] });
      return;
    }

    const rawValues = await submissionModel.getValues(submission.id);
    const shaped = shapeRawValuesForCalculation(rawValues);
    const { results, warnings } = recalculateMonth(shaped);

    res.json({ results, warnings });
  } catch (err) {
    next(err);
  }
}

/** Reshapes flat indicator_values rows into the object recalculateMonth() expects. */
function shapeRawValuesForCalculation(rows: IndicatorValueRow[]): RawCalcInput {
  const byCode: Record<string, Partial<Record<'actual' | 'target' | 'last_year', number>>> = {};
  for (const r of rows) {
    byCode[r.indicatorCode] = byCode[r.indicatorCode] || {};
    const key = r.valueType.toLowerCase() as 'actual' | 'target' | 'last_year';
    byCode[r.indicatorCode][key] = Number(r.value);
  }

  return {
    revenue: {
      actual: byCode.total_revenue?.actual ?? 0,
      target: byCode.total_revenue?.target ?? 0,
      lastYear: byCode.total_revenue?.last_year ?? 0,
    },
    cogs: {
      actual: byCode.cogs?.actual ?? 0,
      target: byCode.cogs?.target ?? 0,
      lastYear: byCode.cogs?.last_year ?? 0,
    },
    opex: {
      actual: byCode.opex?.actual ?? 0,
      target: byCode.opex?.target ?? 0,
      lastYear: byCode.opex?.last_year ?? 0,
    },
    nonOpIncome: {
      actual: byCode.non_op_income?.actual ?? 0,
      target: byCode.non_op_income?.target ?? 0,
      lastYear: byCode.non_op_income?.last_year ?? 0,
    },
    financeExpense: {
      actual: byCode.finance_expense?.actual ?? 0,
      target: byCode.finance_expense?.target ?? 0,
      lastYear: byCode.finance_expense?.last_year ?? 0,
    },
    headcountMale: byCode.headcount_male?.actual,
    headcountFemale: byCode.headcount_female?.actual,
    accountsReceivable: byCode.accounts_receivable?.actual,
    overdueAr: byCode.overdue_ar?.actual,
    arAging: {
      lt30: byCode.ar_aging_lt30?.actual ?? 0,
      lt60: byCode.ar_aging_lt60?.actual ?? 0,
      lt90: byCode.ar_aging_lt90?.actual ?? 0,
      gt90: byCode.ar_aging_gt90?.actual ?? 0,
    },
    accountsPayable: byCode.accounts_payable?.actual,
    apAging: byCode.ap_aging_lt30
      ? {
          lt30: byCode.ap_aging_lt30?.actual ?? 0,
          lt60: byCode.ap_aging_lt60?.actual ?? 0,
          lt90: byCode.ap_aging_lt90?.actual ?? 0,
          gt90: byCode.ap_aging_gt90?.actual ?? 0,
        }
      : undefined,
    fixedAssets: byCode.fixed_assets?.actual,
    currentAssets: byCode.current_assets?.actual,
    otherAssets: byCode.other_assets?.actual,
    currentLiabilities: byCode.current_liabilities?.actual,
    longTermLiabilities: byCode.long_term_liabilities?.actual,
    equity: byCode.equity?.actual,
  };
}

export default {
  getConfig,
  saveConfig,
  getMonth,
  saveDraft,
  updateMonth,
  submit,
  getCalculations,
};