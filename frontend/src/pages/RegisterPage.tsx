import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { INTERVIEW_TYPES } from '@/utils/constants';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  experienceLevel: string;
  targetRoles: string;
}

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-1 year)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'senior', label: 'Senior (3-7 years)' },
  { value: 'expert', label: 'Expert (7+ years)' },
];

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      experienceLevel: 'beginner',
      targetRoles: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        experienceLevel: data.experienceLevel as any,
        targetRoles: data.targetRoles.split(',').map((r) => r.trim()).filter(Boolean),
      });
    } catch {
      // error handled in hook
    }
  };

  const passwordChecks = [
    { label: 'At least 8 characters', met: passwordValue?.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'Lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'Number', met: /[0-9]/.test(passwordValue) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue) },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 p-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-secondary-200/30 blur-3xl dark:bg-secondary-900/20" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-900/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-500">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Account
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Start your interview preparation journey
            </p>
          </div>

          <div className="mb-6 flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-primary-500' : 'text-slate-400'}`}>
                  {s === 1 ? 'Account' : 'Profile'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="input-field"
                    placeholder="John Doe"
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      validate: (v) => isValidEmail(v) || 'Invalid email',
                    })}
                    className="input-field"
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        validate: (v) => isValidPassword(v).valid || isValidPassword(v).message,
                      })}
                      className="input-field pr-10"
                      placeholder="Create a strong password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                  {passwordValue && (
                    <div className="mt-2 space-y-1">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-2 text-xs">
                          <span className={check.met ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}>
                            {check.met ? '✓' : '○'}
                          </span>
                          <span className={check.met ? 'text-green-600' : 'text-slate-500'}>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === passwordValue || 'Passwords do not match',
                    })}
                    className="input-field"
                    placeholder="Repeat your password"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
                  Next Step
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="experienceLevel" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    {...register('experienceLevel')}
                    className="input-field"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="targetRoles" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Target Roles (comma separated)
                  </label>
                  <input
                    id="targetRoles"
                    type="text"
                    {...register('targetRoles')}
                    className="input-field"
                    placeholder="Frontend Developer, Full Stack Engineer"
                  />
                  <p className="mt-1 text-xs text-slate-400">E.g., Frontend Developer, DevOps Engineer, Data Scientist</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Interview Interests
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERVIEW_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <span>{type.icon}</span>
                        <span className="text-slate-700 dark:text-slate-300">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? (
                      <svg className="h-5 w-5 animate-spin mx-auto" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
