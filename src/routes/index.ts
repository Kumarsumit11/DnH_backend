import { Router } from 'express';
import authRoutes from './auth.routes';
import companyRoutes from './company.routes';
import investorRoutes from './investor.routes';
import fundingRoutes from './funding.routes';
import investmentRoutes from './investment.routes';
import documentRoutes from './document.routes';
import notificationRoutes from './notification.routes';
import associateRoutes from './associate.routes';
import dashboardRoutes from './dashboard.routes';
import marketRoutes from "./market.routes";

const router = Router();

router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/investor', investorRoutes);
router.use('/funding', fundingRoutes);
router.use('/investments', investmentRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/associate', associateRoutes);
router.use('/dashboard', dashboardRoutes);
router.use("/market", marketRoutes);

export default router;
