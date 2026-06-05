import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  port: number;
  wsPort: number;
  nodeEnv: string;
  logLevel: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiry: string;
  openaiApiKey: string;
  speechToTextApiKey: string;
  fluentHost: string;
  fluentPort: number;
  prometheusEnabled: boolean;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  corsOrigins: string[];
}

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`Warning: Environment variable ${name} is not set, using default`);
    return '';
  }
  return value;
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return ['http://localhost:5173', 'http://localhost:3000'];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function parseIntSafe(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config: EnvConfig = {
  port: parseIntSafe(process.env.PORT, 3000),
  wsPort: parseIntSafe(process.env.WS_PORT, 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
  mongodbUri: requireEnvVar('MONGODB_URI') || 'mongodb://localhost:27017/ai-interview-assistant',
  jwtSecret: requireEnvVar('JWT_SECRET') || 'dev-jwt-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  openaiApiKey: requireEnvVar('OPENAI_API_KEY'),
  speechToTextApiKey: requireEnvVar('SPEECH_TO_TEXT_API_KEY'),
  fluentHost: process.env.FLUENT_HOST || 'localhost',
  fluentPort: parseIntSafe(process.env.FLUENT_PORT, 24224),
  prometheusEnabled: parseBoolean(process.env.PROMETHEUS_ENABLED, true),
  rateLimitWindowMs: parseIntSafe(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  rateLimitMax: parseIntSafe(process.env.RATE_LIMIT_MAX, 100),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';

export default config;
