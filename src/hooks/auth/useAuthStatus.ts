import { useAuth } from '@/contexts/auth/AuthContext';

export const useAuthStatus = () => {
  const { status, initialized, isLoading } = useAuth();
  
  return {
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    isLoading: isLoading || !initialized,
    isError: status === 'error',
    isReady: initialized && !isLoading,
  };
}; 