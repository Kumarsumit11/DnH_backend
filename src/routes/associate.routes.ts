import { Router } from 'express';
import { associateController } from '../controllers/associate.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../constants/roles';

const router = Router();
router.use(authenticate, authorize(Role.ASSOCIATE_PARTNER));

router.get('/companies/pending', associateController.listPendingCompanies);
router.put('/companies/:id/approve', associateController.approveCompany);
router.put('/companies/:id/reject', associateController.rejectCompany);

router.get('/funding/pending', associateController.listPendingFunding);
router.put('/funding/:id/approve', associateController.approveFunding);
router.put('/funding/:id/reject', associateController.rejectFunding);

router.get('/documents/pending', associateController.listPendingDocuments);

router.get('/users', associateController.listUsers);
router.put('/users/:id/suspend', associateController.suspendUser);
router.put('/users/:id/reactivate', associateController.reactivateUser);

router.get('/analytics', associateController.analytics);

export default router;
