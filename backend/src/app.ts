import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { standardLimiter } from './middleware/rateLimiter';
import routes from './routes/index';
import { register as prometheusRegister } from 'prom-client';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);

app.use(standardLimiter);

app.use(routes);

if (config.prometheusEnabled) {
  app.get('/metrics', async (_req, res) => {
    try {
      res.set('Content-Type', prometheusRegister.contentType);
      const metrics = await prometheusRegister.metrics();
      res.end(metrics);
    } catch (error) {
      res.status(500).end('Failed to collect metrics');
    }
  });
}

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'AI Interview Assistant API',
      version: '1.0.0',
      docs: '/api/v1/health',
    },
  });
});

app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

export default app;
