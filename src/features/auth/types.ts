import type { UserRole } from '../../types/enums';

export interface LoginRequest {
  username: string;
  password: string;
  keep_signed_in?: boolean;
}

// Staff login/refresh response — the patient portal has its own, simpler
// shape (see PatientLoginResponse) with no session-management fields at
// all, since it has no refresh endpoint and no server-side idle timeout.
export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id?: string;
  expires_at: string;
  session_expires_at: string;
  idle_timeout_minutes: number;
  idle_warning_seconds: number;
}

export type TokenRefreshResponse = Omit<LoginResponse, 'role' | 'user_id'>;

export interface PatientLoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
