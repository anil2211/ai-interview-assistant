import { Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { IAuthRequest } from '../types';
import { asyncHandler, sendSuccess } from '../utils/helpers';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/env';
import jwt from 'jsonwebtoken';
import { logger } from '../middleware/logger';

export const register = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  });

  if (existingUser) {
    const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
    throw new AppError(
      `A user with this ${field} already exists`,
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.DUPLICATE
    );
  }

  const user = new User({
    username,
    email: email.toLowerCase(),
    password,
  });

  await user.save();

  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  await Session.create({
    userId: user._id,
    type: 'login',
    status: 'active',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  logger.info(`User registered: ${user.email}`);

  sendSuccess(res, {
    user: user.toJSON(),
    accessToken: token,
    refreshToken,
  }, HTTP_STATUS.CREATED);
});

export const login = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  await Session.create({
    userId: user._id,
    type: 'login',
    status: 'active',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  logger.info(`User logged in: ${user.email}`);

  sendSuccess(res, {
    user: user.toJSON(),
    accessToken: token,
    refreshToken,
  });
});

export const logout = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });
    await Session.updateMany(
      { userId: req.user.userId, status: 'active' },
      { status: 'terminated', endedAt: new Date() }
    );
  }

  sendSuccess(res, { message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
  }

  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }

  const newToken = user.generateAuthToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, {
    accessToken: newToken,
    refreshToken: newRefreshToken,
  });
});

export const forgotPassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    sendSuccess(res, { message: 'If an account with that email exists, a password reset link has been sent.' });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = new Date(Date.now() + 3600000);
  await user.save({ validateBeforeSave: false });

  logger.info(`Password reset requested for: ${user.email}`);

  sendSuccess(res, {
    message: 'If an account with that email exists, a password reset link has been sent.',
    resetToken,
  });
});

export const resetPassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { token, password } = req.body;

  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  await Session.updateMany(
    { userId: user._id, status: 'active' },
    { status: 'terminated', endedAt: new Date() }
  );

  logger.info(`Password reset completed for: ${user.email}`);

  sendSuccess(res, { message: 'Password has been reset successfully. Please log in with your new password.' });
});

export const getProfile = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  sendSuccess(res, user.toJSON());
});

export const updateProfile = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const allowedFields = ['username', 'profile', 'preferences'];
  const updates: Record<string, any> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.username) {
    const existingUser = await User.findOne({
      username: updates.username,
      _id: { $ne: req.user!.userId },
    });
    if (existingUser) {
      throw new AppError('Username is already taken', HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  logger.info(`Profile updated for user: ${user.email}`);
  sendSuccess(res, user.toJSON());
});

export const changePassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.userId).select('+password');
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  await Session.updateMany(
    { userId: user._id, status: 'active' },
    { status: 'terminated', endedAt: new Date() }
  );

  logger.info(`Password changed for user: ${user.email}`);
  sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
});
