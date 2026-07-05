import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../constants/roles';

const router = Router();
router.use(authenticate);

router.get('/company', authorize(Role.COMPANY), dashboardController.companyDashboard);
router.get('/investor', authorize(Role.INVESTOR), dashboardController.investorDashboard);
router.get('/associate', authorize(Role.ASSOCIATE_PARTNER), dashboardController.associateDashboard);

export default router;
