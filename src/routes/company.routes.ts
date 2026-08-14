import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { updateCompanyProfileSchema } from '../validators/company.validator';
import { Role } from '../constants/roles';
import { companyUpdateController } from '../controllers/company-update.controller';
import { createCompanyUpdateSchema, editCompanyUpdateSchema } from '../validators/company-update.validator';

const router = Router();
router.use(authenticate, authorize(Role.COMPANY));

router.get('/me', companyController.getMe);
router.put('/profile', validate(updateCompanyProfileSchema), companyController.updateProfile);
router.post('/logo', upload.single('file'), companyController.uploadLogo);
router.post('/submit-verification', companyController.submitForVerification);
router.get('/updates', companyUpdateController.list);
router.post('/updates', validate(createCompanyUpdateSchema), companyUpdateController.create);
router.put('/updates/:id', validate(editCompanyUpdateSchema), companyUpdateController.edit);
router.delete('/updates/:id', companyUpdateController.remove);

export default router;
