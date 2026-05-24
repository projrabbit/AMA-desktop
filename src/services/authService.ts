import type { ApiClient } from '@/lib/api/apiClient';
import type { LoginData, MeData, MessageData, RefreshData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const authEndpoints = {
  login: 'POST /auth/login',
  refresh: 'POST /auth/refresh',
  me: 'GET /auth/me',
  logout: 'POST /auth/logout',
  changePassword: 'PUT /auth/change-password',
} as const;

export function createAuthService(client: ApiClient = apiClient) {
  return {
    login: (body: LoginRequest) =>
      client.post<LoginData>('/auth/login', { body, skipAuth: true, skipRefresh: true }),
    refresh: (body: RefreshTokenRequest) =>
      client.post<RefreshData>('/auth/refresh', { body, skipAuth: true, skipRefresh: true }),
    me: () => client.get<MeData>('/auth/me'),
    logout: (body?: RefreshTokenRequest) => client.post<MessageData>('/auth/logout', { body }),
    changePassword: (body: ChangePasswordRequest) =>
      client.put<MessageData>('/auth/change-password', { body }),
  };
}

export const authService = createAuthService();
