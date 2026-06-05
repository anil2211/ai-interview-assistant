export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  experienceLevel?: ExperienceLevel;
  targetRoles?: string[];
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'senior' | 'expert';

export type InterviewType = 'technical' | 'behavioral' | 'system-design' | 'coding' | 'general' | 'mixed';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type QuestionCategory = 'coding' | 'devops' | 'cloud' | 'system-design' | 'behavioral' | 'algorithms' | 'data-structures' | 'networking' | 'database' | 'security';

export interface Interview {
  id: string;
  userId: string;
  type: InterviewType;
  difficulty: Difficulty;
  status: InterviewStatus;
  questions: Question[];
  answers: Answer[];
  score?: number;
  feedback?: Feedback;
  duration: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type InterviewStatus = 'in-progress' | 'completed' | 'cancelled';

export interface Question {
  id: string;
  interviewId?: string;
  text: string;
  type: InterviewType;
  category: QuestionCategory;
  difficulty: Difficulty;
  tags: string[];
  hints: string[];
  timeLimit: number;
  modelAnswer?: string;
  expectedTopics?: string[];
  followUpQuestions?: string[];
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  interviewId: string;
  text: string;
  audioUrl?: string;
  duration: number;
  transcribedText?: string;
  feedback?: QuestionFeedback;
  createdAt: string;
}

export interface QuestionFeedback {
  score: number;
  technicalAccuracy: number;
  completeness: number;
  clarity: number;
  relevance: number;
  depth: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  modelAnswerComparison?: string;
  alternativeAnswers?: string[];
}

export interface Feedback {
  id: string;
  interviewId: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  detailedFeedback: QuestionFeedback[];
  createdAt: string;
}

export interface CategoryScore {
  category: QuestionCategory;
  score: number;
  questionCount: number;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goals: string[];
  topics: StudyTopic[];
  dailyGoal: number;
  progress: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  category: QuestionCategory;
  resources: Resource[];
  completed: boolean;
  order: number;
  estimatedHours: number;
}

export interface Resource {
  title: string;
  url?: string;
  type: 'article' | 'video' | 'book' | 'course' | 'practice';
}

export interface Analytics {
  totalInterviews: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalDuration: number;
  categoryBreakdown: CategoryScore[];
  scoreTrend: ScoreTrend[];
  strengths: string[];
  weaknesses: string[];
  streak: number;
  lastActive: string;
}

export interface ScoreTrend {
  date: string;
  score: number;
  type: InterviewType;
}

export interface PerformanceData {
  labels: string[];
  scores: number[];
  average: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  experienceLevel?: ExperienceLevel;
  targetRoles?: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface WebSocketEvents {
  transcription: (data: TranscriptionData) => void;
  feedback: (data: QuestionFeedback) => void;
  interviewComplete: (data: Feedback) => void;
  error: (error: string) => void;
  questionChanged: (question: Question) => void;
  timeWarning: (seconds: number) => void;
}

export interface TranscriptionData {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FilterOptions {
  type?: InterviewType;
  difficulty?: Difficulty;
  category?: QuestionCategory;
  dateRange?: [string, string];
  scoreRange?: [number, number];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ThemeMode = 'light' | 'dark';
