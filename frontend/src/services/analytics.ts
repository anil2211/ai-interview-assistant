import api from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  Analytics,
  PerformanceData,
  CategoryScore,
  ApiResponse,
} from '@/types';

export async function getDashboard(): Promise<Analytics> {
  const response = await api.get<ApiResponse<{ dashboard: Analytics }>>(
    API_ENDPOINTS.ANALYTICS.DASHBOARD
  );
  return response.data.data.dashboard;
}

export async function getPerformance(params?: {
  period?: string;
  category?: string;
}): Promise<PerformanceData> {
  const response = await api.get<ApiResponse<{ progress: PerformanceData }>>(
    API_ENDPOINTS.ANALYTICS.PERFORMANCE,
    { params }
  );
  return response.data.data.progress;
}

export async function getWeaknesses(): Promise<string[]> {
  const response = await api.get<ApiResponse<{ weaknesses: string[] }>>(
    API_ENDPOINTS.ANALYTICS.WEAKNESSES
  );
  return response.data.data.weaknesses;
}

export async function getStrengths(): Promise<string[]> {
  const response = await api.get<ApiResponse<{ strengths: string[] }>>(
    API_ENDPOINTS.ANALYTICS.STRENGTHS
  );
  return response.data.data.strengths;
}

export async function getProgress(params?: {
  period?: string;
}): Promise<{ dates: string[]; scores: number[] }> {
  const response = await api.get<
    ApiResponse<{ progress: { dates: string[]; scores: number[] }; weaknesses: string[]; strengths: string[] }>
  >(API_ENDPOINTS.ANALYTICS.PROGRESS, { params });
  return response.data.data.progress;
}

export async function getCategoryBreakdown(): Promise<CategoryScore[]> {
  const response = await api.get<ApiResponse<{ breakdown: CategoryScore[] }>>(
    API_ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN
  );
  return response.data.data.breakdown;
}

export async function exportAnalytics(
  format: 'pdf' | 'json' | 'csv' = 'pdf'
): Promise<Blob> {
  const response = await api.get(API_ENDPOINTS.ANALYTICS.EXPORT, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
}
