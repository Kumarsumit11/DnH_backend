import { Router } from 'express';
import { associateController } from '../controllers/associate.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { Role } from '../constants/roles';
import {
  documentReviewSchema,
  listDocumentsQuerySchema,
  sendMessageSchema,
  listMessagesQuerySchema,
  companyIdParamSchema
} from '../validators/associate.validator';

const router = Router();

// Every route below requires a logged-in ASSOCIATE_PARTNER account.
router.use(authenticate, authorize(Role.ASSOCIATE_PARTNER));

router.get('/dashboard', associateController.dashboard);

router.get('/companies', associateController.listCompanies);
router.get('/companies/:id', validate(companyIdParamSchema), associateController.getCompanyDetail);

router.get('/documents', validate(listDocumentsQuerySchema), associateController.listDocuments);
router.put('/documents/:id/review', validate(documentReviewSchema), associateController.reviewDocument);

router.get('/funding', associateController.listFunding);

router.get('/messages', validate(listMessagesQuerySchema), associateController.listMessages);
router.post('/messages', validate(sendMessageSchema), associateController.sendMessage);

router.get('/profile', associateController.getProfile);

export default router;
