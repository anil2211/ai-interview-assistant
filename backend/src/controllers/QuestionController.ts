import { Response } from 'express';
import { Question } from '../models/Question';
import { IAuthRequest } from '../types';
import { asyncHandler, sendSuccess, parsePaginationParams, paginateResults } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';

export const getQuestions = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { category, difficulty, subcategory, tags, search } = req.query;
  const pagination = parsePaginationParams(req.query);

  const filter: Record<string, any> = { isActive: true };

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (subcategory) filter.subcategory = subcategory;
  if (tags) {
    const tagArray = (tags as string).split(',');
    filter.tags = { $in: tagArray };
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOrder = pagination.order === 'asc' ? 1 : -1;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ [pagination.sort as string]: sortOrder })
      .skip((pagination.page! - 1) * pagination.limit!)
      .limit(pagination.limit!)
      .lean(),
    Question.countDocuments(filter),
  ]);

  const result = paginateResults(questions, total, pagination);
  sendSuccess(res, result.data, HTTP_STATUS.OK, result.pagination);
});

export const getQuestionById = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    throw new AppError('Question not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  sendSuccess(res, { question });
});

export const createQuestion = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const questionData = {
    ...req.body,
    createdBy: req.user!.userId,
  };

  const question = await Question.create(questionData);
  sendSuccess(res, { question }, HTTP_STATUS.CREATED);
});

export const updateQuestion = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!question) {
    throw new AppError('Question not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  sendSuccess(res, { question });
});

export const deleteQuestion = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!question) {
    throw new AppError('Question not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  sendSuccess(res, { message: 'Question deactivated successfully' });
});

export const getQuestionsByCategory = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { category } = req.params;
  const { difficulty } = req.query;
  const pagination = parsePaginationParams(req.query);

  const filter: Record<string, any> = { category, isActive: true };
  if (difficulty) filter.difficulty = difficulty;

  const sortOrder = pagination.order === 'asc' ? 1 : -1;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ [pagination.sort as string]: sortOrder })
      .skip((pagination.page! - 1) * pagination.limit!)
      .limit(pagination.limit!)
      .lean(),
    Question.countDocuments(filter),
  ]);

  const result = paginateResults(questions, total, pagination);
  sendSuccess(res, result.data, HTTP_STATUS.OK, result.pagination);
});
