import type { RequestHandler } from 'express';
import { verificationService } from '../services/verification.service';
import {
  verificationDecisionSchema,
  investorIdParamSchema,
  documentIdParamSchema,
  adminDocumentsQuerySchema,
  adminInvestorsQuerySchema,
} from '../validators/verification.validator';
import { companyIdParamSchema } from '../validators/financialAnalysis.validator';

/**
 * Pulls the acting admin's account id + IP off the request.
 * Replace `(req as any).user?.id` with however your auth middleware attaches
 * the authenticated admin (e.g. `req.auth.accountId`, `req.admin.id`, a JWT
 * claim, etc.) once requireAuth/requireAdmin are wired into the routes.
 */
function actorFrom(req: Parameters<RequestHandler>[0]) {
  return {
    adminAccountId: (req as unknown as { user?: { id?: string } }).user?.id ?? null,
    ipAddress: req.ip ?? null,
  };
}

export const verificationController = {
  // PATCH /admin/company/:companyId/verify
  verifyCompany: (async (req, res, next) => {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const decision = verificationDecisionSchema.parse(req.body);
      const result = await verificationService.decideCompanyVerification(companyId, decision, actorFrom(req));
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // GET /admin/investors
  listInvestors: (async (req, res, next) => {
    try {
      const query = adminInvestorsQuerySchema.parse(req.query);
      const result = await verificationService.listInvestors(query);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // PATCH /admin/investor/:investorId/verify
  verifyInvestor: (async (req, res, next) => {
    try {
      const { investorId } = investorIdParamSchema.parse(req.params);
      const decision = verificationDecisionSchema.parse(req.body);
      const result = await verificationService.decideInvestorVerification(investorId, decision, actorFrom(req));
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // GET /admin/documents
  listDocuments: (async (req, res, next) => {
    try {
      const query = adminDocumentsQuerySchema.parse(req.query);
      const result = await verificationService.listDocuments(query);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  // PATCH /admin/documents/:documentId/review
  reviewDocument: (async (req, res, next) => {
    try {
      const { documentId } = documentIdParamSchema.parse(req.params);
      const decision = verificationDecisionSchema.parse(req.body);
      const result = await verificationService.decideDocumentReview(documentId, decision, actorFrom(req));
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
