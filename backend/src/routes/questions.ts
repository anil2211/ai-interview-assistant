import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCategory,
} from '../controllers/QuestionController';
import { authenticate, adminOnly } from '../middleware/auth';
import { objectIdParam, validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getQuestions);
router.get('/category/:category', getQuestionsByCategory);
router.get('/:id', objectIdParam, validate, getQuestionById);

router.post('/', adminOnly, createQuestion);
router.put('/:id', adminOnly, objectIdParam, validate, updateQuestion);
router.delete('/:id', adminOnly, objectIdParam, validate, deleteQuestion);

export default router;
