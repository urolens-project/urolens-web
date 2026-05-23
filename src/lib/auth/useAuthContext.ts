import { useContext } from 'react';
import { AuthContext, type AuthState } from './authContext';

export function useAuthContext(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
