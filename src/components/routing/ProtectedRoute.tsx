import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { RoleGuard } from '@/components/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallbackPath?: string;
  showUnauthorizedMessage?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login',
  showUnauthorizedMessage = false
}) => {
  const { profile, isLoading, initialized } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant l'initialisation
  if (!initialized || isLoading) {
    return <LoadingSpinner />;
  }

  // Si pas de profil, rediriger vers la connexion
  if (!profile) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Si des vérifications de rôle/permission sont requises, utiliser RoleGuard
  if (requiredRole || requiredPermission) {
    return (
      <RoleGuard
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        fallbackPath={fallbackPath}
        showUnauthorizedMessage={showUnauthorizedMessage}
      >
        {children}
      </RoleGuard>
    );
  }

  // Sinon, afficher directement le contenu
  return <>{children}</>;
};

export default ProtectedRoute;
