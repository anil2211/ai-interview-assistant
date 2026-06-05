export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  INTERVIEW: '/interview',
  NEW_INTERVIEW: '/interview/new',
  QUESTIONS: '/questions',
  ANALYTICS: '/analytics',
  STUDY_PLAN: '/study-plan',
  HISTORY: '/history',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh-token',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    PROFILE: '/api/v1/auth/profile',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
  },
  INTERVIEW: {
    BASE: '/api/v1/interviews',
    START: '/api/v1/interviews',
    BY_ID: (id: string) => `/api/v1/interviews/${id}`,
    SUBMIT_ANSWER: (id: string) => `/api/v1/interviews/${id}/answer`,
    NEXT_QUESTION: (id: string) => `/api/v1/interviews/${id}/next`,
    COMPLETE: (id: string) => `/api/v1/interviews/${id}/complete`,
    FEEDBACK: (id: string) => `/api/v1/interviews/${id}/feedback`,
    MODEL_ANSWER: (id: string, qId: string) => `/api/v1/interviews/${id}/model-answer/${qId}`,
    EXPORT: (id: string) => `/api/v1/interviews/${id}/export`,
  },
  QUESTIONS: {
    BASE: '/api/v1/questions',
    BY_ID: (id: string) => `/api/v1/questions/${id}`,
    BY_CATEGORY: (category: string) => `/api/v1/questions/category/${category}`,
  },
  ANALYTICS: {
    DASHBOARD: '/api/v1/analytics/dashboard',
    PERFORMANCE: '/api/v1/analytics/performance',
    WEAKNESSES: '/api/v1/analytics/weaknesses',
    STRENGTHS: '/api/v1/analytics/strengths',
    PROGRESS: '/api/v1/analytics/progress',
    CATEGORY_BREAKDOWN: '/api/v1/analytics/category-breakdown',
    EXPORT: '/api/v1/analytics/export',
  },
  STUDY_PLAN: {
    BASE: '/api/v1/study-plans',
    BY_ID: (id: string) => `/api/v1/study-plans/${id}`,
    PROGRESS: (id: string) => `/api/v1/study-plans/${id}/progress`,
    RECOMMENDATIONS: '/api/v1/study-plans/recommendations',
  },
} as const;

export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical', icon: '💻', color: '#6366f1' },
  { value: 'behavioral', label: 'Behavioral', icon: '🧠', color: '#14b8a6' },
  { value: 'system-design', label: 'System Design', icon: '🏗️', color: '#f97316' },
  { value: 'coding', label: 'Coding', icon: '⌨️', color: '#8b5cf6' },
  { value: 'general', label: 'General', icon: '📋', color: '#06b6d4' },
  { value: 'mixed', label: 'Mixed', icon: '🎯', color: '#ec4899' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermediate', color: '#eab308' },
  { value: 'advanced', label: 'Advanced', color: '#f97316' },
  { value: 'expert', label: 'Expert', color: '#ef4444' },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  coding: '#6366f1',
  devops: '#14b8a6',
  cloud: '#06b6d4',
  'system-design': '#f97316',
  behavioral: '#ec4899',
  algorithms: '#8b5cf6',
  'data-structures': '#a855f7',
  networking: '#0ea5e9',
  database: '#22c55e',
  security: '#ef4444',
};

export const SCORE_THRESHOLDS = {
  poor: 40,
  average: 70,
  good: 85,
  excellent: 100,
} as const;
