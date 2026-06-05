import { Document, Types } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead';
    targetRoles?: string[];
    techStack?: string[];
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    emailNotifications: boolean;
  };
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  category: 'coding' | 'devops' | 'cloud' | 'system-design' | 'behavioral';
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  content: string;
  modelAnswer: string;
  hints: string[];
  tags: string[];
  expectedTopics: string[];
  timeLimit: number;
  codeSnippet?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewQuestion {
  questionId: Types.ObjectId;
  question: string;
  answer?: string;
  modelAnswer?: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
  aiGenerated: boolean;
}

export interface IInterview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'coding' | 'devops' | 'cloud' | 'system-design' | 'behavioral';
  status: 'in-progress' | 'completed' | 'cancelled';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: IInterviewQuestion[];
  overallScore?: number;
  strengths: string[];
  weaknesses: string[];
  duration?: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedback extends Document {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  questionId: Types.ObjectId;
  userId: Types.ObjectId;
  score: number;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  technicalAccuracy: number;
  completeness: number;
  clarity: number;
  relevance: number;
  structureScore: number;
  communicationScore: number;
  aiGeneratedFeedback: string;
  modelAnswer: string;
  alternativeAnswers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'login' | 'interview' | 'study';
  status: 'active' | 'expired' | 'terminated';
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  startedAt: Date;
  lastActivity: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalytics {
  userId: Types.ObjectId;
  totalInterviews: number;
  averageScore: number;
  totalStudyHours: number;
  completedTopics: number;
  categoryScores: Record<string, number>;
  strengthAreas: string[];
  weakAreas: string[];
  progressOverTime: { date: Date; score: number }[];
  lastActiveAt: Date;
}

export interface IStudyPlanTopic {
  name: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
  resources: string[];
}

export interface IStudyPlanSchedule {
  date: Date;
  topic: string;
  duration: number;
  completed: boolean;
}

export interface IStudyPlanProgress {
  overallPercentage: number;
  topicsCompleted: number;
  hoursSpent: number;
}

export interface IStudyPlan extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  goals: string[];
  targetDate?: Date;
  dailyGoal: number;
  topics: IStudyPlanTopic[];
  schedule: IStudyPlanSchedule[];
  progress: IStudyPlanProgress;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResource extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'book' | 'documentation';
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebSocketEvents {
  'join-interview': { interviewId: string };
  'leave-interview': { interviewId: string };
  'transcribe-audio': { audio: string; interviewId: string };
  'transcription-result': { text: string; isFinal: boolean; interviewId: string };
  'answer-submitted': { interviewId: string; questionId: string };
  'feedback-received': { interviewId: string; questionId: string; score: number };
  'typing-indicator': { interviewId: string; userId: string; isTyping: boolean };
  'error': { message: string; code: string };
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IJwtPayload {
  userId: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    role: 'user' | 'admin';
  };
}

export interface ILLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface ITranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  language?: string;
}

export interface IExportData {
  title: string;
  date: Date;
  sections: {
    title: string;
    content: string;
    type: 'text' | 'table' | 'list';
    data?: unknown[];
  }[];
}
