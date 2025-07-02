# 🔧 EXEMPLES DE CODE COMPLETS - AUTHENTIFICATION BULLETPROOF

## 📋 Types TypeScript (`src/types/auth.ts`)

```typescript
import { User } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'agency' | 'visiteur'; // ⚠️ ADAPTER VOS RÔLES
  agency_id?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean; // Critical pour éviter les race conditions
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: User; profile: UserProfile } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile };

export interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasRole: (role: string) => boolean;
  isAgency: () => boolean;
  isAdmin: () => boolean;
}
```

## 🔄 Reducer (`src/contexts/auth/authReducer.ts`)

```typescript
import { AuthState, AuthAction } from '@/types/auth';

export const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  initialized: false,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        status: action.payload ? 'loading' : state.status,
        error: action.payload ? null : state.error,
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        status: 'authenticated',
        user: action.payload.user,
        profile: action.payload.profile,
        isLoading: false,
        error: null,
        initialized: true,
      };

    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        status: 'unauthenticated',
        user: null,
        profile: null,
        isLoading: false,
        error: null,
        initialized: true,
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
        isLoading: false,
        initialized: true,
      };

    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload };

    default:
      return state;
  }
};
```

## 🎯 Hook de Statut (`src/hooks/auth/useAuthStatus.ts`)

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

## 🔐 Hook de Redirection (`src/hooks/auth/useRequireAuth.ts`)

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

## 🛡️ Composant de Protection (`src/components/auth/AuthGuard.tsx`)

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

  // Loader pendant l'initialisation
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
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

## 🔗 Hook Principal (`src/hooks/useAuth.tsx`)

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

## 📱 Intégration App.tsx

```typescript
import AuthProvider from '@/contexts/auth/AuthContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* ⚠️ WRAPPER OBLIGATOIRE */}
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Vos routes */}
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## 📚 EXEMPLES D'UTILISATION PRATIQUE

### ✅ Composant Basique Sécurisé

```typescript
import { useAuth, useAuthStatus } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, profile, signOut } = useAuth();
  const { isAuthenticated, isReady } = useAuthStatus();

  // ⚠️ TOUJOURS vérifier isReady avant d'afficher du contenu
  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Bienvenue {profile?.first_name}!</h2>
            <p className="text-sm text-gray-600">Rôle: {profile?.role}</p>
            <p className="text-sm text-gray-600">Email: {user?.email}</p>
          </div>
          <button 
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-amber-800">Veuillez vous connecter pour accéder à cette page</p>
        </div>
      )}
    </div>
  );
};
```

### ✅ Chargement de Données avec React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth, useAuthStatus } from '@/hooks/useAuth';

const UserDataComponent = () => {
  const { user, profile } = useAuth();
  const { isReady, isAuthenticated } = useAuthStatus();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user!.id}/data`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    // ⚠️ CRITIQUE : évite les race conditions
    enabled: isReady && isAuthenticated && !!user?.id,
    refetchOnWindowFocus: false,
  });

  if (!isReady) return <div>Initialisation...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;
  if (isLoading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h2>Données utilisateur</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

### ✅ Protection de Route Avancée

```typescript
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

// Page admin protégée
const AdminPage = () => (
  <AuthGuard requireAuth={true} requireRole="admin">
    <div className="p-6">
      <h1 className="text-2xl font-bold">Administration</h1>
      {/* Contenu admin */}
    </div>
  </AuthGuard>
);

// Page avec fallback personnalisé
const PremiumPage = () => {
  const UpgradePrompt = () => (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Accès Premium Requis</h2>
      <button className="px-6 py-2 bg-blue-500 text-white rounded">
        Passer Premium
      </button>
    </div>
  );

  return (
    <AuthGuard 
      requireAuth={true} 
      requireRole="premium"
      fallback={<UpgradePrompt />}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Contenu Premium</h1>
        {/* Contenu premium */}
      </div>
    </AuthGuard>
  );
};

// Page publique avec contenu conditionnel
const HomePage = () => {
  const { profile } = useAuth();
  const { isAuthenticated, isReady } = useAuthStatus();

  return (
    <AuthGuard requireAuth={false}>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Bienvenue</h1>
        {isReady && (
          <>
            {isAuthenticated ? (
              <p>Bonjour {profile?.first_name}!</p>
            ) : (
              <p>Connectez-vous pour accéder à plus de fonctionnalités</p>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
};
```

### ✅ Hook de Redirection Personnalisé

```typescript
import { useRequireAuth } from '@/hooks/useAuth';

const PrivatePage = () => {
  // Se redirige automatiquement vers /login si non connecté
  const { isAuthenticated, isReady } = useRequireAuth('/login');
  
  if (!isReady) return <div>Chargement...</div>;
  
  return (
    <div className="p-6">
      <h1>Page privée</h1>
      <p>Contenu accessible seulement aux utilisateurs connectés</p>
    </div>
  );
};

// Avec redirection personnalisée
const AdminOnlyPage = () => {
  const { isAuthenticated } = useRequireAuth('/admin-login');
  
  return (
    <div className="p-6">
      <h1>Administration</h1>
      <p>Contenu admin</p>
    </div>
  );
};
```

*Ces exemples garantissent une authentification stable et prévisible !* 🛡️ 