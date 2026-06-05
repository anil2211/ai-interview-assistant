import api from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '@/types';

function normalizeUser(raw: any): User {
  const profile = raw.profile || {};
  return {
    id: raw._id || raw.id || '',
    name: raw.username || raw.name || '',
    email: raw.email || '',
    avatar: profile.avatar || raw.avatar || '',
    experienceLevel: profile.experienceLevel || raw.experienceLevel || undefined,
    targetRoles: profile.targetRoles || raw.targetRoles || [],
    bio: profile.bio || raw.bio || '',
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  };
}

function denormalizeUser(data: Partial<User>): Record<string, any> {
  const body: Record<string, any> = {};
  if (data.name !== undefined) body.username = data.name;
  if (data.email !== undefined) body.email = data.email;
  if (data.bio !== undefined || data.experienceLevel !== undefined || data.targetRoles !== undefined || data.avatar !== undefined) {
    body.profile = {};
    if (data.bio !== undefined) body.profile.bio = data.bio;
    if (data.experienceLevel !== undefined) body.profile.experienceLevel = data.experienceLevel;
    if (data.targetRoles !== undefined) body.profile.targetRoles = data.targetRoles;
    if (data.avatar !== undefined) body.profile.avatar = data.avatar;
  }
  return body;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<any>>(
    API_ENDPOINTS.AUTH.LOGIN,
    data
  );
  const raw = response.data.data;
  return {
    user: normalizeUser(raw.user),
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
  };
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<any>>(
    API_ENDPOINTS.AUTH.REGISTER,
    { username: data.name, email: data.email, password: data.password }
  );
  const raw = response.data.data;
  return {
    user: normalizeUser(raw.user),
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
  };
}

export async function logout(): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export async function refreshToken(
  token: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await api.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >(API_ENDPOINTS.AUTH.REFRESH, { refreshToken: token });
  return response.data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
}

export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<any>>(
    API_ENDPOINTS.AUTH.PROFILE
  );
  return normalizeUser(response.data.data);
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.put<ApiResponse<any>>(
    API_ENDPOINTS.AUTH.PROFILE,
    denormalizeUser(data)
  );
  return normalizeUser(response.data.data);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
}
