import express from 'express';
import { verificationController } from '../controllers/verification.controller';

// Plug in your existing auth/role middleware here, e.g.:
// import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// PATCH /admin/company/:companyId/verify   { action: 'VERIFY' | 'REJECT', rejectionReason? }
router.patch(
  '/company/:companyId/verify',
  /* requireAuth, requireAdmin, */ verificationController.verifyCompany
);

// GET /admin/investors
router.get('/investors', /* requireAuth, requireAdmin, */ verificationController.listInvestors);

// PATCH /admin/investor/:investorId/verify   { action: 'VERIFY' | 'REJECT', rejectionReason? }
router.patch(
  '/investor/:investorId/verify',
  /* requireAuth, requireAdmin, */ verificationController.verifyInvestor
);

// GET /admin/documents?status=PENDING&type=KYC&accountId=...&page=1&limit=20
router.get('/documents', /* requireAuth, requireAdmin, */ verificationController.listDocuments);

// PATCH /admin/documents/:documentId/review   { action: 'VERIFY' | 'REJECT', rejectionReason? }
router.patch(
  '/documents/:documentId/review',
  /* requireAuth, requireAdmin, */ verificationController.reviewDocument
);

export default router;
