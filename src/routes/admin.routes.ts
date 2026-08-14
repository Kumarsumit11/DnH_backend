import express from 'express';
import { adminController } from '../controllers/admin.controller';

// Plug in your existing auth/role middleware here, e.g.:
import { adminAuthenticate } from '../middleware/adminAuth.middleware';

const router = express.Router();

router.use(adminAuthenticate);

// GET /admin/companies
router.get('/companies', /* requireAuth, requireAdmin, */ adminController.listCompanies);

router.get(
  '/company/:companyId/updates',);
// GET /admin/company/:companyId
router.get('/company/:companyId', /* requireAuth, requireAdmin, */ adminController.getCompanyDetail);

router.get('/investor/:investorId/investments', adminController.getInvestorInvestments);



// GET /admin/company/:companyId/charts
router.get(
  '/company/:companyId/charts',
  /* requireAuth, requireAdmin, */ adminController.getCompanyCharts
);



export default router;
