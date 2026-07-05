import { Router } from 'express';
import { investmentController } from '../controllers/investment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProposalSchema, proposalStatusSchema } from '../validators/investment.validator';
import { Role } from '../constants/roles';

const router = Router();
router.use(authenticate);

// Investor
router.post('/proposals', authorize(Role.INVESTOR), validate(createProposalSchema), investmentController.createProposal);
router.get('/proposals/mine', authorize(Role.INVESTOR), investmentController.listOwnProposals);
router.get('/investments/mine', authorize(Role.INVESTOR), investmentController.listOwnInvestments);

// Company
router.get('/proposals/received', authorize(Role.COMPANY), investmentController.listCompanyProposals);
router.put('/proposals/:id/respond', authorize(Role.COMPANY), validate(proposalStatusSchema), investmentController.respondToProposal);
router.get('/investments/received', authorize(Role.COMPANY), investmentController.listCompanyInvestments);

export default router;
