import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

export const useRequireAuth = (redirectTo: string = '/login') => {
  const { status, initialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && status === 'unauthenticated') {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate(redirectTo);
    }
  }, [status, initialized, navigate, redirectTo]);

  return {
    isAuthenticated: status === 'authenticated',
    isReady: initialized,
  };
}; 