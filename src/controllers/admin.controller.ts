import type { RequestHandler } from 'express';
import { adminService } from '../services/admin.service';
import {
  companyIdParamSchema,
  chartsQuerySchema,
  adminCompaniesQuerySchema,
} from '../validators/financialAnalysis.validator';

export const adminController = {
  // GET /admin/companies
  listCompanies: (async (req, res, next) => {
    try {
      const query = adminCompaniesQuerySchema.parse(req.query);
      const result = await adminService.listCompanies(query);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // GET /admin/company/:companyId
  getCompanyDetail: (async (req, res, next) => {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const result = await adminService.getCompanyDetail(companyId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // GET /admin/company/:companyId/charts
  getCompanyCharts: (async (req, res, next) => {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const { months } = chartsQuerySchema.parse(req.query);
      const result = await adminService.getCompanyCharts(companyId, months);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
