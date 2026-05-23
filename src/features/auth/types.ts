import type { UserRole } from '../../types/enums';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
