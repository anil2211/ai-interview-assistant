import api from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  Interview,
  Question,
  Answer,
  Feedback,
  QuestionFeedback,
  ApiResponse,
  PaginatedResponse,
  InterviewType,
  Difficulty,
} from '@/types';

export interface StartInterviewRequest {
  type: InterviewType;
  difficulty: Difficulty;
  topics?: string[];
  questionCount?: number;
  usePredefined?: boolean;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
  audioBlob?: Blob;
  timeSpent: number;
}

const TYPE_MAP: Record<string, string> = {
  technical: 'coding',
  general: 'behavioral',
  mixed: 'system-design',
};

export async function startInterview(
  data: StartInterviewRequest
): Promise<Interview> {
  const body = {
    ...data,
    type: TYPE_MAP[data.type] || data.type,
  };
  const response = await api.post<ApiResponse<{ interview: any }>>(
    API_ENDPOINTS.INTERVIEW.START,
    body
  );
  const raw = response.data.data.interview;
  return {
    id: raw._id || raw.id,
    userId: raw.userId || '',
    type: raw.type || 'technical',
    difficulty: raw.difficulty || 'intermediate',
    status: raw.status || 'in-progress',
    questions: (raw.questions || []).map((q: any, idx: number) => ({
      id: q.questionId || `q-${idx}`,
      text: q.question,
      type: raw.type || 'technical',
      category: raw.type === 'coding' ? 'algorithms' : raw.type,
      difficulty: raw.difficulty || 'intermediate',
      tags: [],
      hints: q.hints || [],
      timeLimit: q.timeLimit || 300,
      modelAnswer: q.modelAnswer,
      createdAt: '',
    })),
    answers: [],
    score: raw.overallScore,
    duration: raw.duration || 0,
    startedAt: raw.startedAt || new Date().toISOString(),
    completedAt: raw.completedAt,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export async function getInterviews(params?: {
  page?: number;
  limit?: number;
  type?: InterviewType;
  status?: string;
  sortBy?: string;
}): Promise<PaginatedResponse<Interview>> {
  const response = await api.get<{
    success: boolean;
    data: Interview[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
  }>(API_ENDPOINTS.INTERVIEW.BASE, { params });
  return {
    data: response.data.data,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 10,
    total: response.data.meta?.total || 0,
    totalPages: response.data.meta?.totalPages || 0,
  };
}

export async function getInterviewById(
  id: string
): Promise<Interview> {
  const response = await api.get<ApiResponse<{ interview: Interview }>>(
    API_ENDPOINTS.INTERVIEW.BY_ID(id)
  );
  return response.data.data.interview;
}

export async function submitAnswer(
  interviewId: string,
  data: SubmitAnswerRequest
): Promise<Answer> {
  const response = await api.post<ApiResponse<{ interview: Interview; feedback?: QuestionFeedback }>>(
    API_ENDPOINTS.INTERVIEW.SUBMIT_ANSWER(interviewId),
    {
      questionId: data.questionId,
      answer: data.answer,
      timeSpent: data.timeSpent,
    }
  );
  const answer: Answer = {
    id: '',
    questionId: data.questionId,
    interviewId,
    text: data.answer,
    audioUrl: undefined,
    duration: data.timeSpent,
    feedback: response.data.data.feedback,
    createdAt: new Date().toISOString(),
  };
  return answer;
}

export async function getNextQuestion(
  interviewId: string
): Promise<Question> {
  const response = await api.get<any>(
    API_ENDPOINTS.INTERVIEW.NEXT_QUESTION(interviewId)
  );
  const data = response.data.data;
  if (data.isComplete || !data.question) {
    throw new Error(data.message || 'Interview is complete');
  }
  const q = data.question;
  return {
    id: q.questionId || q._id || '',
    text: q.question || '',
    type: q.type || 'technical',
    category: q.category || q.topic || 'general',
    difficulty: q.difficulty || 'intermediate',
    tags: q.tags || [],
    hints: q.hints || [],
    timeLimit: q.timeLimit || 300,
    modelAnswer: q.modelAnswer,
    createdAt: q.createdAt || new Date().toISOString(),
  };
}

export async function completeInterview(
  interviewId: string
): Promise<Interview> {
  const response = await api.post<ApiResponse<{ interview: Interview }>>(
    API_ENDPOINTS.INTERVIEW.COMPLETE(interviewId)
  );
  return response.data.data.interview;
}

export async function getFeedback(
  interviewId: string
): Promise<Feedback> {
  const response = await api.get<any>(
    API_ENDPOINTS.INTERVIEW.FEEDBACK(interviewId)
  );
  const raw = response.data.data.feedback;
  const items = Array.isArray(raw) ? raw : [raw];
  const scores = items.filter((f: any) => f.score != null).map((f: any) => f.score);
  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : 0;
  return {
    id: '',
    interviewId,
    overallScore,
    categoryScores: [],
    strengths: [...new Set(items.flatMap((f: any) => f.strengths || []))],
    weaknesses: [...new Set(items.flatMap((f: any) => f.weaknesses || []))],
    suggestions: [...new Set(items.flatMap((f: any) => f.suggestions || []))],
    summary: `Completed with average score ${overallScore}%`,
    detailedFeedback: items.map((f: any) => ({
      score: f.score || 0,
      technicalAccuracy: f.technicalAccuracy || 0,
      completeness: f.completeness || 0,
      clarity: f.clarity || 0,
      relevance: f.relevance || 0,
      depth: f.structureScore || 0,
      strengths: f.strengths || [],
      weaknesses: f.weaknesses || [],
      suggestions: f.suggestions || [],
      modelAnswerComparison: f.aiGeneratedFeedback,
      alternativeAnswers: f.alternativeAnswers,
    })),
    createdAt: new Date().toISOString(),
  };
}

export async function getModelAnswer(
  interviewId: string,
  questionId: string
): Promise<{ modelAnswer: string }> {
  const response = await api.get<
    ApiResponse<{ modelAnswer: string }>
  >(API_ENDPOINTS.INTERVIEW.MODEL_ANSWER(interviewId, questionId));
  return response.data.data;
}

export async function exportReport(
  interviewId: string,
  format: 'pdf' | 'json' = 'pdf'
): Promise<Blob> {
  const response = await api.get(
    API_ENDPOINTS.INTERVIEW.EXPORT(interviewId),
    {
      params: { format },
      responseType: 'blob',
    }
  );
  return response.data;
}
