import { Router } from 'express';
import {
  getDashboard,
  getPerformance,
  getWeaknesses,
  getStrengths,
  getProgress,
  getCategoryBreakdown,
  exportAnalytics,
} from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/performance', getPerformance);
router.get('/weaknesses', getWeaknesses);
router.get('/strengths', getStrengths);
router.get('/progress', getProgress);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/export', exportAnalytics);

export default router;
