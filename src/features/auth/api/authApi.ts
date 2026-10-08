import apiClient from '../../../lib/apiClient';
import type { LoginRequest, LoginResponse, TokenRefreshResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  refresh: (): Promise<TokenRefreshResponse> =>
    apiClient.post<TokenRefreshResponse>('/auth/refresh').then((res) => res.data),

  // reason: 'INACTIVITY' tells the backend this was the idle-timeout
  // signing the user out, not a deliberate logout — recorded differently
  // for audit (UROLENS-245), and skips revoking push notification tokens.
  logout: (reason?: 'INACTIVITY'): Promise<{ message: string }> =>
    apiClient
      .post<{ message: string }>('/auth/logout', reason ? { reason } : undefined)
      .then((res) => res.data),
};
