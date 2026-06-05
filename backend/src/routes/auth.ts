import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  validate,
} from '../middleware/validation';

const router = Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
