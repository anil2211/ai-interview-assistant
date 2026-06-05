import { Router } from 'express';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  updateProgress,
  getRecommendations,
  exportPlan,
} from '../controllers/StudyPlanController';
import { authenticate } from '../middleware/auth';
import { objectIdParam, validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getPlans);
router.get('/recommendations', getRecommendations);
router.get('/:id', objectIdParam, validate, getPlanById);
router.get('/:id/export', objectIdParam, validate, exportPlan);

router.post('/', createPlan);
router.put('/:id', objectIdParam, validate, updatePlan);
router.put('/:id/progress', objectIdParam, validate, updateProgress);
router.delete('/:id', objectIdParam, validate, deletePlan);

export default router;
