import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from './logger';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';
import { IApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }
}

export class ValidationError_ extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

function handleMongooseValidationError(err: mongoose.Error.ValidationError): AppError {
  const details = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
}

function handleMongooseCastError(err: mongoose.Error.CastError): AppError {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
}

function handleDuplicateKeyError(err: any): AppError {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for ${field}. This ${field} is already taken.`;
  return new AppError(message, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE);
}

function handleJwtError(): AppError {
  return new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
}

function handleJwtExpiredError(): AppError {
  return new AppError('Token has expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof AppError) {
    const response: IApiResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const appError = handleMongooseValidationError(err);
    const response: IApiResponse = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
        details: appError.details,
      },
    };
    res.status(appError.statusCode).json(response);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    const appError = handleMongooseCastError(err);
    const response: IApiResponse = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
      },
    };
    res.status(appError.statusCode).json(response);
    return;
  }

  if ((err as any).code === 11000 || (err as any).code === 11001) {
    const appError = handleDuplicateKeyError(err);
    const response: IApiResponse = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
      },
    };
    res.status(appError.statusCode).json(response);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    const appError = handleJwtError();
    const response: IApiResponse = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
      },
    };
    res.status(appError.statusCode).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const appError = handleJwtExpiredError();
    const response: IApiResponse = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
      },
    };
    res.status(appError.statusCode).json(response);
    return;
  }

  const response: IApiResponse = {
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: ERROR_CODES.INTERNAL_ERROR,
    },
  };
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
}
