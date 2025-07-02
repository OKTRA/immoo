
// NOUVEAU SYSTÈME D'AUTHENTIFICATION CENTRALISÉ
export { useAuth } from '@/contexts/auth/AuthContext';
export { useAuthStatus } from '@/hooks/auth/useAuthStatus';
export { useRequireAuth } from '@/hooks/auth/useRequireAuth';

// Hook de compatibilité pour l'ancien système
import { useAuth as useAuthContext } from '@/contexts/auth/AuthContext';

export const useAuthLegacy = () => {
  const { user, profile, isLoading } = useAuthContext();
  
  return {
    user,
    userRole: profile?.role || null,
    isLoading,
  };
};

// Export par défaut pour la compatibilité
export default useAuthLegacy;
