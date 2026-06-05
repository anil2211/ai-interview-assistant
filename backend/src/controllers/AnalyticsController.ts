import { Response } from 'express';
import analyticsService from '../services/AnalyticsService';
import exportService from '../services/ExportService';
import { IAuthRequest } from '../types';
import { asyncHandler, sendSuccess } from '../utils/helpers';

export const getDashboard = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const dashboard = await analyticsService.getDashboard(req.user!.userId);
  sendSuccess(res, { dashboard });
});

export const getPerformance = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { period } = req.query;

  const progress = await analyticsService.getProgressOverTime(
    req.user!.userId,
    (period as any) || '30d'
  );

  sendSuccess(res, { progress });
});

export const getWeaknesses = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const weaknesses = await analyticsService.generateWeaknessAnalysis(req.user!.userId);
  sendSuccess(res, { weaknesses });
});

export const getStrengths = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const strengths = await analyticsService.generateStrengthAnalysis(req.user!.userId);
  sendSuccess(res, { strengths });
});

export const getProgress = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { period } = req.query;

  const progress = await analyticsService.getProgressOverTime(
    req.user!.userId,
    (period as any) || '30d'
  );

  const weaknesses = await analyticsService.generateWeaknessAnalysis(req.user!.userId);
  const strengths = await analyticsService.generateStrengthAnalysis(req.user!.userId);

  sendSuccess(res, {
    progress,
    weaknesses,
    strengths,
  });
});

export const getCategoryBreakdown = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const breakdown = await analyticsService.getCategoryBreakdown(req.user!.userId);
  sendSuccess(res, { breakdown });
});

export const exportAnalytics = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { period } = req.query;

  const pdfBuffer = await exportService.exportPerformanceAnalytics(
    req.user!.userId,
    (period as any) || '30d'
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=analytics-${req.user!.userId}.pdf`);
  res.send(pdfBuffer);
});
