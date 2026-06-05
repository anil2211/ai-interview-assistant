import api from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  Question,
  QuestionCategory,
  Difficulty,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export async function getQuestions(params?: {
  page?: number;
  limit?: number;
  category?: QuestionCategory;
  difficulty?: Difficulty;
  search?: string;
  tags?: string[];
  sortBy?: string;
}): Promise<PaginatedResponse<Question>> {
  const response = await api.get<{
    success: boolean;
    data: Question[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
  }>(API_ENDPOINTS.QUESTIONS.BASE, { params });
  return {
    data: response.data.data,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 10,
    total: response.data.meta?.total || 0,
    totalPages: response.data.meta?.totalPages || 0,
  };
}

export async function getQuestionById(
  id: string
): Promise<Question> {
  const response = await api.get<ApiResponse<{ question: Question }>>(
    API_ENDPOINTS.QUESTIONS.BY_ID(id)
  );
  return response.data.data.question;
}

export async function getQuestionsByCategory(
  category: QuestionCategory,
  params?: {
    page?: number;
    limit?: number;
    difficulty?: Difficulty;
  }
): Promise<PaginatedResponse<Question>> {
  const response = await api.get<{
    success: boolean;
    data: Question[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
  }>(API_ENDPOINTS.QUESTIONS.BY_CATEGORY(category), { params });
  return {
    data: response.data.data,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 10,
    total: response.data.meta?.total || 0,
    totalPages: response.data.meta?.totalPages || 0,
  };
}
