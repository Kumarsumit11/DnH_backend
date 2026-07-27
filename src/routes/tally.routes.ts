import express from 'express';
import tallyController from '../controllers/tally.controller';
// import { requireAuth } from '../middleware/auth'; // reuse your existing auth middleware

const router = express.Router();
// router.use(requireAuth);

router.get('/config/:companyId', tallyController.getConfig);
router.post('/config/:companyId', tallyController.saveConfig);

router.get('/calculations', tallyController.getCalculations);

router.get('/:companyId/:fiscalYear/:month', tallyController.getMonth);
router.put('/:companyId/:fiscalYear/:month', tallyController.updateMonth);

router.post('/save-draft', tallyController.saveDraft);
router.post('/submit', tallyController.submit);

export default router;
