import { Router } from 'express';
import {
  startInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  getNextQuestion,
  completeInterview,
  getFeedback,
  getModelAnswer,
  exportInterviewReport,
} from '../controllers/InterviewController';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import {
  createInterviewValidation,
  submitAnswerValidation,
  validate,
} from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.get('/:id/next', getNextQuestion);
router.get('/:interviewId/feedback', getFeedback);
router.get('/:interviewId/feedback/:questionId', getFeedback);
router.get('/:interviewId/model-answer/:questionId', getModelAnswer);
router.get('/:interviewId/export', exportInterviewReport);

router.post('/', createInterviewValidation, validate, startInterview);
router.post('/:interviewId/answer', aiLimiter, submitAnswerValidation, validate, submitAnswer);
router.post('/:interviewId/complete', completeInterview);

export default router;
