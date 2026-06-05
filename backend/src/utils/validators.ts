import { Types } from 'mongoose';
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS } from './constants';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

export function isValidDifficulty(difficulty: string): boolean {
  return DIFFICULTY_LEVELS.includes(difficulty as any);
}

export function isValidInterviewType(type: string): boolean {
  return INTERVIEW_TYPES.includes(type as any);
}

export function isValidRole(role: string): boolean {
  return ['user', 'admin'].includes(role);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidLanguage(lang: string): boolean {
  const supportedLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
    'ar', 'hi', 'bn', 'pa', 'jv', 'vi', 'ta', 'te', 'mr', 'gu',
  ];
  return supportedLanguages.includes(lang.toLowerCase());
}

export function sanitizeString(input: string, maxLength: number = 5000): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, maxLength);
}

export function isValidScore(score: number): boolean {
  return typeof score === 'number' && !isNaN(score) && score >= 0 && score <= 100;
}

export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function isPositiveInteger(value: any): boolean {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}
