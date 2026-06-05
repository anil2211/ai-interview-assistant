import { Router } from 'express';
import authRoutes from './auth';
import interviewRoutes from './interview';
import questionRoutes from './questions';
import analyticsRoutes from './analytics';
import studyPlanRoutes from './studyplan';

const router = Router();

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/interviews', interviewRoutes);
apiV1Router.use('/questions', questionRoutes);
apiV1Router.use('/analytics', analyticsRoutes);
apiV1Router.use('/study-plans', studyPlanRoutes);

apiV1Router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    },
  });
});

router.use('/api/v1', apiV1Router);

export default router;
