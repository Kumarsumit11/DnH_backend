import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateCompanyProfileSchema } from '../validators/company.validator';
import { Role } from '../constants/roles';

const router = Router();
router.use(authenticate, authorize(Role.COMPANY));

router.get('/me', companyController.getMe);
router.put('/profile', validate(updateCompanyProfileSchema), companyController.updateProfile);
router.post('/logo', upload.single('file'), companyController.uploadLogo);
router.post('/submit-verification', companyController.submitForVerification);

export default router;
