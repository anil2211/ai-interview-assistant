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


const allowedOrigins = [
  "https://ai-interview-assistant-ntfxqwwfi.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// IMPORTANT: must be FIRST
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

export default app;
