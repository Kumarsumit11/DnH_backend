import { Router } from 'express';
import { associateAdminController } from '../controllers/associateAdmin.controller';
import { adminAuthenticate } from '../middleware/adminAuth.middleware';

const router = Router();
router.use(adminAuthenticate);

router.post('/', associateAdminController.create);
router.get('/', associateAdminController.list);

export default router;
