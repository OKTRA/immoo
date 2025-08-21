import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallbackPath?: string;
  showUnauthorizedMessage?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/',
  showUnauthorizedMessage = true
}) => {
  const { profile, isLoading, hasRole, hasPermission, getUserRole } = useAuth();

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-immoo-gold"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier le rôle requis
  if (requiredRole && !hasRole(requiredRole)) {
    if (showUnauthorizedMessage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-immoo-navy mb-4">
              Accès Refusé
            </h1>
            <p className="text-immoo-navy/70 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="bg-immoo-navy/5 p-4 rounded-lg mb-6">
              <p className="text-sm text-immoo-navy/60">
                <strong>Rôle requis :</strong> {requiredRole}
              </p>
              <p className="text-sm text-immoo-navy/60">
                <strong>Votre rôle :</strong> {getUserRole()}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="bg-immoo-gold text-immoo-navy px-6 py-2 rounded-lg font-semibold hover:bg-immoo-gold-light transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Vérifier la permission requise
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (showUnauthorizedMessage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-immoo-navy mb-4">
              Permission Insuffisante
            </h1>
            <p className="text-immoo-navy/70 mb-6">
              Vous n'avez pas la permission "{requiredPermission}" pour accéder à cette page.
            </p>
            <div className="bg-immoo-navy/5 p-4 rounded-lg mb-6">
              <p className="text-sm text-immoo-navy/60">
                <strong>Permission requise :</strong> {requiredPermission}
              </p>
              <p className="text-sm text-immoo-navy/60">
                <strong>Votre rôle :</strong> {getUserRole()}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="bg-immoo-gold text-immoo-navy px-6 py-2 rounded-lg font-semibold hover:bg-immoo-gold-light transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Si toutes les vérifications passent, afficher le contenu
  return <>{children}</>;
};

export default RoleGuard;
