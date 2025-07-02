import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole,
  fallback
}) => {
  const { status, initialized, hasRole, isLoading } = useAuth();

  // Afficher le loader pendant l'initialisation
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-immoo-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initialisation...</p>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && status !== 'authenticated') {
    return fallback || <Navigate to="/login" replace />;
  }

  // Si un rôle spécifique est requis
  if (requireRole && !hasRole(requireRole)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 