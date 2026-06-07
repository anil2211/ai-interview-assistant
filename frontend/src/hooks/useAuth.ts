import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/auth';
import type { LoginRequest, RegisterRequest, User } from '@/types';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>;
    if (typeof data.message === 'string') return data.message;
    if (data.error && typeof data.error === 'object') {
      const errObj = data.error as Record<string, unknown>;
      if (typeof errObj.message === 'string') return errObj.message;
      if (typeof errObj.code === 'string') return errObj.code;
    }
    if (typeof data.error === 'string') return data.error;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    login: loginStore,
    logout: logoutStore,
    updateUser,
  } = useAuthStore();

  const login = useCallback(
    async (data: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.login(data);
        loginStore(response.user, response.accessToken, response.refreshToken);
        toast.success('Welcome back!');
        navigate('/dashboard');
        return response;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loginStore, setLoading, setError, navigate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.register(data);
        loginStore(response.user, response.accessToken, response.refreshToken);
        toast.success('Account created successfully!');
        navigate('/dashboard');
        return response;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loginStore, setLoading, setError, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API call fails
    } finally {
      logoutStore();
      toast.success('Logged out successfully');
      navigate('/login');
    }
  }, [logoutStore, navigate]);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch {
      logoutStore();
      navigate('/login');
    }
  }, [setUser, logoutStore, navigate]);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        const updated = await authService.updateProfile(data as any);
        updateUser(updated);
        toast.success('Profile updated');
        return updated;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        toast.error(message);
        throw err;
      }
    },
    [updateUser]
  );

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
  };
}
