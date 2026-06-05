export const INTERVIEW_TYPES = ['coding', 'devops', 'cloud', 'system-design', 'behavioral'] as const;
export type InterviewType = typeof INTERVIEW_TYPES[number];

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const ROLES = ['user', 'admin'] as const;
export type Role = typeof ROLES[number];

export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  AVERAGE: 60,
  POOR: 40,
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  admin: 100,
  user: 1,
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const SUPPORTED_AUDIO_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/mp4'];

export const LLM_MODELS = {
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT3_5_TURBO: 'gpt-3.5-turbo',
  WHISPER_1: 'whisper-1',
  TEXT_EMBEDDING_3: 'text-embedding-3-small',
} as const;

export const SYSTEM_PROMPTS = {
  coding: `You are an expert technical interviewer evaluating coding interview responses.
Evaluate based on: code correctness, efficiency, code quality, problem-solving approach, and communication.
Provide specific, actionable feedback with a score from 0-100.`,

  devops: `You are a senior DevOps engineer evaluating interview responses.
Evaluate based on: technical knowledge, practical experience, architecture decisions, security awareness, and problem-solving.
Provide specific, actionable feedback with a score from 0-100.`,

  cloud: `You are a cloud architect evaluating interview responses.
Evaluate based on: cloud service knowledge, architecture design, cost optimization, security, scalability, and best practices.
Provide specific, actionable feedback with a score from 0-100.`,

  'system-design': `You are a systems architect evaluating interview responses.
Evaluate based on: system design principles, scalability, reliability, trade-off analysis, and communication.
Provide specific, actionable feedback with a score from 0-100.`,

  behavioral: `You are an HR expert evaluating behavioral interview responses.
Evaluate based on: STAR method usage, relevance, clarity, self-awareness, and soft skills.
Provide specific, actionable feedback with a score from 0-100.`,
};

export const STUDY_PLAN_SYSTEM_PROMPT = `You are an expert career coach specializing in technical interview preparation.
Create personalized study plans that address candidate weaknesses while building on strengths.
Focus on practical, actionable learning paths with specific resources and timelines.`;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  DUPLICATE: 'DUPLICATE',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  SPEECH_SERVICE_ERROR: 'SPEECH_SERVICE_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const INTERVIEW_QUESTION_COUNTS: Record<string, number> = {
  beginner: 5,
  intermediate: 8,
  advanced: 10,
};

export const MAX_RETRY_ATTEMPTS = 3;
export const CACHE_TTL_SECONDS = 3600;
export const AI_TIMEOUT_MS = 30000;
export const RATE_LIMIT_AUTH_MAX = 20;
export const RATE_LIMIT_AI_MAX = 10;
