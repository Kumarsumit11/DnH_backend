import { Router } from 'express';
import { fundingController } from '../controllers/funding.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createFundingSchema, updateFundingSchema } from '../validators/funding.validator';
import { Role } from '../constants/roles';

const router = Router();

// Public / cross-role
router.get('/active', authenticate, fundingController.listActive);
router.get('/:id', authenticate, fundingController.getById);

// Company only
router.post('/', authenticate, authorize(Role.COMPANY), validate(createFundingSchema), fundingController.create);
router.get('/', authenticate, authorize(Role.COMPANY), fundingController.listOwn);
router.put('/:id', authenticate, authorize(Role.COMPANY), validate(updateFundingSchema), fundingController.update);
router.delete('/:id', authenticate, authorize(Role.COMPANY), fundingController.delete);

export default router;
