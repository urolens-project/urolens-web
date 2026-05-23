import { useAuthContext } from './auth/useAuthContext';
import type { UserRole } from '../types/enums';

export function useRole(): UserRole | null {
  const { role } = useAuthContext();
  return role;
}
