import express from 'express';
import { adminController } from '../controllers/admin.controller';

// Plug in your existing auth/role middleware here, e.g.:
// import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// GET /admin/companies
router.get('/companies', /* requireAuth, requireAdmin, */ adminController.listCompanies);

// GET /admin/company/:companyId
router.get('/company/:companyId', /* requireAuth, requireAdmin, */ adminController.getCompanyDetail);

// GET /admin/company/:companyId/charts
router.get(
  '/company/:companyId/charts',
  /* requireAuth, requireAdmin, */ adminController.getCompanyCharts
);

export default router;
