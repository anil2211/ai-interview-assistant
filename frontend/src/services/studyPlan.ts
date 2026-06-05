import api from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  StudyPlan,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export interface CreateStudyPlanRequest {
  title: string;
  description: string;
  goals: string[];
  topics: Array<{
    title: string;
    description: string;
    category: string;
    resources?: Array<{ title: string; url?: string; type: string }>;
    estimatedHours: number;
  }>;
  dailyGoal: number;
  endDate?: string;
}

export async function createPlan(
  data: CreateStudyPlanRequest
): Promise<StudyPlan> {
  const response = await api.post<ApiResponse<{ plan: StudyPlan }>>(
    API_ENDPOINTS.STUDY_PLAN.BASE,
    data
  );
  return response.data.data.plan;
}

export async function getPlans(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<StudyPlan>> {
  const response = await api.get<{
    success: boolean;
    data: StudyPlan[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
  }>(API_ENDPOINTS.STUDY_PLAN.BASE, { params });
  return {
    data: response.data.data,
    page: response.data.meta?.page || 1,
    limit: response.data.meta?.limit || 10,
    total: response.data.meta?.total || 0,
    totalPages: response.data.meta?.totalPages || 0,
  };
}

export async function getPlanById(
  id: string
): Promise<StudyPlan> {
  const response = await api.get<ApiResponse<{ plan: StudyPlan }>>(
    API_ENDPOINTS.STUDY_PLAN.BY_ID(id)
  );
  return response.data.data.plan;
}

export async function updatePlan(
  id: string,
  data: Partial<StudyPlan>
): Promise<StudyPlan> {
  const response = await api.put<ApiResponse<{ plan: StudyPlan }>>(
    API_ENDPOINTS.STUDY_PLAN.BY_ID(id),
    data
  );
  return response.data.data.plan;
}

export async function deletePlan(id: string): Promise<void> {
  await api.delete(API_ENDPOINTS.STUDY_PLAN.BY_ID(id));
}

export async function updateProgress(
  id: string,
  topicId: string,
  completed: boolean
): Promise<StudyPlan> {
  const response = await api.put<ApiResponse<{ plan: StudyPlan }>>(
    API_ENDPOINTS.STUDY_PLAN.PROGRESS(id),
    { topicName: topicId, durationSpent: completed ? 1 : 0 }
  );
  return response.data.data.plan;
}

export async function getRecommendations(): Promise<StudyPlan[]> {
  const response = await api.get<ApiResponse<{ resources: StudyPlan[] }>>(
    API_ENDPOINTS.STUDY_PLAN.RECOMMENDATIONS,
    { params: { topic: 'general' } }
  );
  return response.data.data.resources;
}
