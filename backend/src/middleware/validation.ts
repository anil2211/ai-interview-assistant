import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS } from '../utils/constants';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array().map(e => ({
          field: (e as any).path || (e as any).param,
          message: e.msg,
        })),
      },
    });
    return;
  }
  next();
}

export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
    .withMessage('Password must contain at least one special character'),
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const createInterviewValidation: ValidationChain[] = [
  body('type')
    .isIn(INTERVIEW_TYPES)
    .withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(', ')}`),
  body('difficulty')
    .isIn(DIFFICULTY_LEVELS)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`),
];

export const submitAnswerValidation: ValidationChain[] = [
  param('interviewId')
    .isMongoId()
    .withMessage('Invalid interview ID'),
  body('questionId')
    .isMongoId()
    .withMessage('Invalid question ID'),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Answer must be between 1 and 10000 characters'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer'),
];

export const createStudyPlanValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('goals')
    .isArray({ min: 1 })
    .withMessage('At least one goal is required'),
  body('goals.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each goal must be a non-empty string'),
  body('dailyGoal')
    .optional()
    .isFloat({ min: 0.5, max: 24 })
    .withMessage('Daily goal must be between 0.5 and 24 hours'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid date'),
];

export const updateProfileValidation: ValidationChain[] = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('profile.experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Experience level must be one of: entry, mid, senior, lead'),
  body('profile.targetRoles')
    .optional()
    .isArray()
    .withMessage('Target roles must be an array'),
  body('profile.techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),
  body('preferences.language')
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code'),
];

export const objectIdParam: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

export const paginationQuery: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString(),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];
