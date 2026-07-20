import type { RequestHandler } from 'express';
import { financialAnalysisService } from '../services/financialAnalysis.service';
import {
  financialAnalysisUpsertSchema,
  companyIdParamSchema,
} from '../validators/financialAnalysis.validator';

export const financialAnalysisController = {
  // POST /financial-analysis
  upsert: (async (req, res, next) => {
    try {
      const payload = financialAnalysisUpsertSchema.parse(req.body);
      const result = await financialAnalysisService.upsert(payload);
      res.status(200).json({
        success: true,
        message: 'Financial analysis saved successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // GET /financial-analysis/company/:companyId
  getByCompanyId: (async (req, res, next) => {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const result = await financialAnalysisService.getByCompanyId(companyId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // GET /financial-analysis/company/:companyId/dashboard
  getDashboard: (async (req, res, next) => {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const result = await financialAnalysisService.getDashboard(companyId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
