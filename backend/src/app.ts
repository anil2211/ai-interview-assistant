import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { register as prometheusRegister } from 'prom-client';

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { standardLimiter } from './middleware/rateLimiter';
import routes from './routes/index';

const app = express();

/* =========================
   1. TRUSTED SECURITY HEADERS
========================= */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* =========================
   2. CORS (MUST BE FIRST)
========================= */
const allowedOrigins = [
  'https://ai-interview.sirvisamaj.online',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('❌ CORS Blocked:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

/* 🔥 CRITICAL: Handle preflight requests */
app.options('*', cors(corsOptions));

/* =========================
   3. BODY PARSERS
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =========================
   4. REQUEST LOGGER
========================= */
app.use(requestLogger);

/* =========================
   5. RATE LIMITER (SAFE FOR OPTIONS)
========================= */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next(); // IMPORTANT FIX

  return standardLimiter(req, res, next);
});

/* =========================
   6. ROUTES
========================= */
app.use('/api/v1', routes);

/* =========================
   7. HEALTH / METRICS
========================= */
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

/* =========================
   8. ROOT ROUTE
========================= */
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

/* =========================
   9. ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   10. 404 HANDLER
========================= */
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