import apiClient from '../../../lib/apiClient';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  logout: (): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/auth/logout').then((res) => res.data),
};
