import { Router } from 'express';
import { investorController } from '../controllers/investor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateInvestorProfileSchema, browseCompaniesQuerySchema } from '../validators/investor.validator';
import { Role } from '../constants/roles';

const router = Router();
router.use(authenticate, authorize(Role.INVESTOR));

router.get('/me', investorController.getMe);
router.put('/profile', validate(updateInvestorProfileSchema), investorController.updateProfile);
router.post('/avatar', upload.single('file'), investorController.uploadAvatar);
router.get('/companies', validate(browseCompaniesQuerySchema), investorController.browseCompanies);
router.get('/companies/:id', investorController.getCompanyDetail);

export default router;
