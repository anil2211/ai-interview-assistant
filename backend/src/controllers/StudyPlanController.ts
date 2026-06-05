import { Response } from 'express';
import { StudyPlan } from '../models/StudyPlan';
import studyPlanService from '../services/StudyPlanService';
import exportService from '../services/ExportService';
import { IAuthRequest } from '../types';
import { asyncHandler, sendSuccess, parsePaginationParams, paginateResults } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';

export const createPlan = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const plan = await studyPlanService.generatePlan(req.user!.userId);
  sendSuccess(res, { plan }, HTTP_STATUS.CREATED);
});

export const getPlans = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const pagination = parsePaginationParams(req.query);

  const filter: Record<string, any> = { userId: req.user!.userId };
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const sortOrder = pagination.order === 'asc' ? 1 : -1;

  const [plans, total] = await Promise.all([
    StudyPlan.find(filter)
      .sort({ [pagination.sort as string]: sortOrder })
      .skip((pagination.page! - 1) * pagination.limit!)
      .limit(pagination.limit!)
      .lean(),
    StudyPlan.countDocuments(filter),
  ]);

  const result = paginateResults(plans, total, pagination);
  sendSuccess(res, result.data, HTTP_STATUS.OK, result.pagination);
});

export const getPlanById = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const plan = await StudyPlan.findById(req.params.id);

  if (!plan) {
    throw new AppError('Study plan not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  if (plan.userId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to view this plan', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }

  sendSuccess(res, { plan });
});

export const updatePlan = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { title, description, goals, targetDate, dailyGoal, topics, schedule, isActive } = req.body;

  const updateData: Record<string, any> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (goals !== undefined) updateData.goals = goals;
  if (targetDate !== undefined) updateData.targetDate = targetDate;
  if (dailyGoal !== undefined) updateData.dailyGoal = dailyGoal;
  if (topics !== undefined) updateData.topics = topics;
  if (schedule !== undefined) updateData.schedule = schedule;
  if (isActive !== undefined) updateData.isActive = isActive;

  const plan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!plan) {
    throw new AppError('Study plan not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  sendSuccess(res, { plan });
});

export const deletePlan = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const plan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { isActive: false },
    { new: true }
  );

  if (!plan) {
    throw new AppError('Study plan not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  sendSuccess(res, { message: 'Study plan deleted successfully' });
});

export const updateProgress = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { topicName, durationSpent } = req.body;

  const plan = await studyPlanService.updateProgress(req.params.id, topicName, durationSpent);

  sendSuccess(res, { plan });
});

export const getRecommendations = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { topic } = req.query;

  if (!topic) {
    throw new AppError('Topic query parameter is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  const resources = await studyPlanService.getRecommendedResources(
    req.user!.userId,
    topic as string
  );

  sendSuccess(res, { resources });
});

export const exportPlan = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const pdfBuffer = await exportService.exportStudyPlan(req.params.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=study-plan-${req.params.id}.pdf`);
  res.send(pdfBuffer);
});
