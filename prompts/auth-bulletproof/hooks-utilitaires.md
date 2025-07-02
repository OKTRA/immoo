# 🔧 HOOKS UTILITAIRES - SYSTÈME BULLETPROOF

## 📁 Structure des fichiers

```
src/
├── hooks/
│   ├── useAuth.tsx (hook principal)
│   └── auth/
│       ├── useAuthStatus.ts
│       └── useRequireAuth.ts
└── components/auth/
    └── AuthGuard.tsx
```

## 🎯 Hook de Statut : `src/hooks/auth/useAuthStatus.ts`

```typescript
import { useAuth } from '@/contexts/auth/AuthContext';

export const useAuthStatus = () => {
  const { status, initialized, isLoading } = useAuth();
  
  return {
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    isLoading: isLoading || !initialized,
    isError: status === 'error',
    isReady: initialized && !isLoading, // ⚠️ CRITIQUE pour race conditions
  };
};
```

## 🔐 Hook de Redirection : `src/hooks/auth/useRequireAuth.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner'; // ⚠️ ADAPTER VOTRE SYSTÈME

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
```

## 🛡️ Composant de Protection : `src/components/auth/AuthGuard.tsx`

```typescript
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

  // Loader pendant l'initialisation - ⚠️ ADAPTER VOS STYLES
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    );
  }

  // Redirection si auth requise mais pas connecté
  if (requireAuth && status !== 'authenticated') {
    return fallback || <Navigate to="/login" replace />;
  }

  // Redirection si rôle spécifique requis
  if (requireRole && !hasRole(requireRole)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
```

## 🔗 Hook Principal Unifié : `src/hooks/useAuth.tsx`

```typescript
// ✅ NOUVEAU SYSTÈME CENTRALISÉ
export { useAuth } from '@/contexts/auth/AuthContext';
export { useAuthStatus } from '@/hooks/auth/useAuthStatus';
export { useRequireAuth } from '@/hooks/auth/useRequireAuth';

// 🔄 Hook de compatibilité pour migration douce
import { useAuth as useAuthContext } from '@/contexts/auth/AuthContext';

export const useAuthLegacy = () => {
  const { user, profile, isLoading } = useAuthContext();
  
  return {
    user,
    userRole: profile?.role || null,
    isLoading,
  };
};

export default useAuthLegacy;
```

## 📚 EXEMPLES D'UTILISATION PRATIQUES

### ✅ Utilisation basique optimale

```typescript
import { useAuth, useAuthStatus } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, profile, signOut } = useAuth();
  const { isAuthenticated, isReady } = useAuthStatus();

  // ⚠️ TOUJOURS vérifier isReady avant d'afficher du contenu
  if (!isReady) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bonjour {profile?.first_name}!</p>
          <p>Rôle: {profile?.role}</p>
          <button onClick={signOut}>Se déconnecter</button>
        </div>
      ) : (
        <p>Veuillez vous connecter</p>
      )}
    </div>
  );
};
```

### ✅ Chargement de données sécurisé avec React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth, useAuthStatus } from '@/hooks/useAuth';

const DataComponent = () => {
  const { user, profile } = useAuth();
  const { isReady, isAuthenticated } = useAuthStatus();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: () => fetchUserData(user!.id),
    // ⚠️ CRITIQUE : évite les race conditions
    enabled: isReady && isAuthenticated && !!user?.id,
  });

  if (!isReady) return <div>Initialisation...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;
  if (isLoading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return <div>{/* Vos données */}</div>;
};
```

### ✅ Protection de route avancée

```typescript
import AuthGuard from '@/components/auth/AuthGuard';

// Page admin protégée
const AdminPage = () => (
  <AuthGuard requireAuth={true} requireRole="admin">
    <AdminDashboard />
  </AuthGuard>
);

// Page avec fallback personnalisé
const PremiumPage = () => (
  <AuthGuard 
    requireAuth={true} 
    requireRole="premium"
    fallback={<UpgradePrompt />}
  >
    <PremiumContent />
  </AuthGuard>
);

// Page publique optionnellement enrichie
const PublicPage = () => (
  <AuthGuard requireAuth={false}>
    <PublicContent />
  </AuthGuard>
);
```

### ✅ Hook de redirection automatique

```typescript
import { useRequireAuth } from '@/hooks/useAuth';

const PrivatePage = () => {
  // Se redirige automatiquement vers /login si non connecté
  const { isAuthenticated, isReady } = useRequireAuth('/login');
  
  if (!isReady) return <div>Chargement...</div>;
  
  return <PrivateContent />;
};

// Avec redirection personnalisée
const AdminOnlyPage = () => {
  const { isAuthenticated } = useRequireAuth('/admin-login');
  
  return <AdminContent />;
};
```

## 🔄 MIGRATION DE L'ANCIEN SYSTÈME

### ❌ Avant (problématique)

```typescript
const { user, isLoading: authLoading } = useAuth();

// Problèmes :
// - Race conditions si user change pendant le chargement
// - Pas de distinction entre "en cours d'init" et "prêt"
// - Données qui se chargent avant l'auth

useEffect(() => {
  if (user) {
    fetchData(); // ⚠️ Race condition possible
  }
}, [user]);

const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  enabled: !!user, // ⚠️ Peut se déclencher trop tôt
});
```

### ✅ Après (bulletproof)

```typescript
const { user, profile } = useAuth();
const { isAuthenticated, isReady } = useAuthStatus();

// Solutions :
// - isReady évite les race conditions
// - États clairs et prévisibles
// - Chargement sécurisé des données

useEffect(() => {
  if (isReady && isAuthenticated && user) {
    fetchData(); // ✅ Sécurisé
  }
}, [isReady, isAuthenticated, user?.id]);

const { data } = useQuery({
  queryKey: ['data', user?.id],
  queryFn: () => fetchData(user!.id),
  enabled: isReady && isAuthenticated && !!user?.id, // ✅ Bulletproof
});
```

## 🎯 CHECKLIST DE MIGRATION

- [ ] Remplacer `const { user, isLoading: authLoading } = useAuth()`
- [ ] Par `const { user, profile } = useAuth(); const { isReady, isAuthenticated } = useAuthStatus()`
- [ ] Remplacer `authLoading` par `!isReady`
- [ ] Ajouter `isReady &&` dans toutes les conditions d'auth
- [ ] Mettre à jour `enabled` dans les queries React Query
- [ ] Ajouter des logs pour debug si nécessaire
- [ ] Tester les cas edge (refresh, déconnexion, cross-tab)

*Ces hooks garantissent une authentification stable et prévisible !* 🛡️ 