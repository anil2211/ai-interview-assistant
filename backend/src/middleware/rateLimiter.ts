import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { RATE_LIMIT_AUTH_MAX, RATE_LIMIT_AI_MAX } from '../utils/constants';

const standardLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT',
    },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'RATE_LIMIT',
    },
  },
  skipSuccessfulRequests: true,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMIT_AI_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'AI service rate limit exceeded. Please wait before making another request.',
      code: 'RATE_LIMIT',
    },
  },
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Export limit reached. Please try again later.',
      code: 'RATE_LIMIT',
    },
  },
});

export { standardLimiter, authLimiter, aiLimiter, exportLimiter };
export default standardLimiter;
