import express from 'express';
import { financialAnalysisController } from '../controllers/financialAnalysis.controller';

// Plug in your existing auth/role middleware here, e.g.:
// import { requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

// POST /financial-analysis
router.post('/', /* requireAuth, */ financialAnalysisController.upsert);

// GET /financial-analysis/company/:companyId
router.get('/company/:companyId', /* requireAuth, */ financialAnalysisController.getByCompanyId);

// GET /financial-analysis/company/:companyId/dashboard
router.get(
  '/company/:companyId/dashboard',
  /* requireAuth, */ financialAnalysisController.getDashboard
);

export default router;
