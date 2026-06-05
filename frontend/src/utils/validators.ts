export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
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
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
}

export function required(value: string | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  return value.trim().length > 0;
}

export function minLength(min: number) {
  return (value: string): boolean => value.length >= min;
}

export function maxLength(max: number) {
  return (value: string): boolean => value.length <= max;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0;
}

export function isInRange(min: number, max: number) {
  return (value: number): boolean => value >= min && value <= max;
}
