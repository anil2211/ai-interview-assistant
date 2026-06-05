import { Response } from 'express';
import { Interview } from '../models/Interview';
import interviewService from '../services/InterviewService';
import exportService from '../services/ExportService';
import { IAuthRequest } from '../types';
import { asyncHandler, sendSuccess, parsePaginationParams, paginateResults } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';

export const startInterview = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { type, difficulty } = req.body;

  const interview = await interviewService.startInterview(
    req.user!.userId,
    type,
    difficulty
  );

  sendSuccess(res, { interview }, HTTP_STATUS.CREATED);
});

export const getInterviews = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { status, type, difficulty } = req.query;
  const pagination = parsePaginationParams(req.query);

  const filter: Record<string, any> = { userId: req.user!.userId };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (difficulty) filter.difficulty = difficulty;

  const sortOrder = pagination.order === 'asc' ? 1 : -1;

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .sort({ [pagination.sort as string]: sortOrder })
      .skip((pagination.page! - 1) * pagination.limit!)
      .limit(pagination.limit!)
      .lean(),
    Interview.countDocuments(filter),
  ]);

  const result = paginateResults(interviews, total, pagination);

  sendSuccess(res, result.data, HTTP_STATUS.OK, result.pagination);
});

export const getInterviewById = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    throw new AppError('Interview not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  if (interview.userId.toString() !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to view this interview', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }

  sendSuccess(res, { interview });
});

export const submitAnswer = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { interviewId } = req.params;
  const { questionId, answer, timeSpent } = req.body;

  const result = await interviewService.submitAnswer(interviewId, questionId, answer, timeSpent);

  sendSuccess(res, {
    interview: result.interview,
    feedback: result.feedback,
  });
});

export const getNextQuestion = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { interviewId } = req.params;

  const result = await interviewService.getNextQuestion(interviewId);

  if (result.isComplete) {
    sendSuccess(res, {
      message: 'All questions have been answered. You can complete the interview.',
      ...result,
    });
    return;
  }

  sendSuccess(res, result);
});

export const completeInterview = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { interviewId } = req.params;

  const interview = await interviewService.completeInterview(interviewId);

  sendSuccess(res, { interview });
});

export const getFeedback = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { interviewId, questionId } = req.params;

  const feedback = await interviewService.getFeedback(interviewId, questionId);

  sendSuccess(res, { feedback });
});

export const getModelAnswer = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { interviewId, questionId } = req.params;

  const modelAnswer = await interviewService.getModelAnswer(interviewId, questionId);

  sendSuccess(res, { modelAnswer });
});

export const exportInterviewReport = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { interviewId } = req.params;

  const pdfBuffer = await exportService.exportInterviewReport(interviewId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=interview-report-${interviewId}.pdf`);
  res.send(pdfBuffer);
});
