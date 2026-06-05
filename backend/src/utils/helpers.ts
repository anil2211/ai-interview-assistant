import { v4 as uuidv4 } from 'uuid';
import { Response, NextFunction } from 'express';
import { SCORE_THRESHOLDS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants';
import { IPaginationParams, IPaginationResult, IApiResponse } from '../types';

export function generateId(): string {
  return uuidv4();
}

export function calculateScore(
  technicalAccuracy: number,
  completeness: number,
  clarity: number,
  relevance: number,
  structureScore: number,
  communicationScore: number
): number {
  const weights = {
    technicalAccuracy: 0.3,
    completeness: 0.2,
    clarity: 0.15,
    relevance: 0.15,
    structureScore: 0.1,
    communicationScore: 0.1,
  };

  const score =
    technicalAccuracy * weights.technicalAccuracy +
    completeness * weights.completeness +
    clarity * weights.clarity +
    relevance * weights.relevance +
    structureScore * weights.structureScore +
    communicationScore * weights.communicationScore;

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export function paginateResults<T>(
  data: T[],
  total: number,
  params: IPaginationParams
): IPaginationResult<T> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(Math.max(1, params.limit || DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200, meta?: IApiResponse['meta']): void {
  const response: IApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: unknown
): void {
  const response: IApiResponse = {
    success: false,
    error: { message, code, details },
  };
  res.status(statusCode).json(response);
}

export function asyncHandler(
  fn: (req: any, res: Response, next: NextFunction) => Promise<any>
): (req: any, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'Good';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return 'Average';
  return 'Needs Improvement';
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function parsePaginationParams(query: any): IPaginationParams {
  return {
    page: parseInt(query.page, 10) || 1,
    limit: parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE,
    sort: query.sort || 'createdAt',
    order: query.order === 'asc' ? 'asc' : 'desc',
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): Partial<T> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
