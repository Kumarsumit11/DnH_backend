import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { documentStatusSchema } from '../validators/document.validator';
import { Role } from '../constants/roles';

const router = Router();
router.use(authenticate);

router.post('/', upload.single('file'), documentController.upload);
router.get('/mine', documentController.listOwn);
router.delete('/:id', documentController.delete);

// Associate partner review
router.get('/pending', authorize(Role.ASSOCIATE_PARTNER), documentController.listPending);
router.put('/:id/review', authorize(Role.ASSOCIATE_PARTNER), validate(documentStatusSchema), documentController.review);

export default router;
