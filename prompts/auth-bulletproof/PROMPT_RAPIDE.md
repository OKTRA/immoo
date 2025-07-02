# 🛡️ AUTHENTIFICATION BULLETPROOF - PROMPT RAPIDE

## 🎯 PROMPT UNIVERSEL

> **Implémente un système d'authentification bulletproof pour React/TypeScript + Supabase qui élimine les race conditions, sessions qui flashent, et problèmes cross-tab. Utilise React Context + useReducer avec types stricts et hooks utilitaires.**

## 📁 STRUCTURE REQUISE

```
src/
├── types/auth.ts                    # Types TypeScript stricts
├── contexts/auth/
│   ├── authReducer.ts              # Reducer d'état
│   └── AuthContext.tsx             # Contexte principal
├── hooks/auth/
│   ├── useAuthStatus.ts            # Hook de statut
│   └── useRequireAuth.ts           # Hook de redirection
├── components/auth/
│   └── AuthGuard.tsx               # Protection de routes
└── hooks/useAuth.tsx               # Hook principal unifié
```

## 🔧 TYPES CRITIQUES

```typescript
// src/types/auth.ts
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean; // ⚠️ CRITIQUE pour race conditions
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'agency' | 'visiteur'; // ⚠️ ADAPTER VOS RÔLES
  // ... autres champs selon votre projet
}
```

## 📚 UTILISATION OPTIMALE

```typescript
// Utilisation basique sécurisée
const { user, profile, signOut } = useAuth();
const { isAuthenticated, isReady } = useAuthStatus();

// ⚠️ TOUJOURS vérifier isReady avant d'afficher du contenu
if (!isReady) return <div>Chargement...</div>;

return (
  <div>
    {isAuthenticated ? (
      <div>
        <p>Bonjour {profile?.first_name}</p>
        <button onClick={signOut}>Déconnexion</button>
      </div>
    ) : (
      <p>Non connecté</p>
    )}
  </div>
);
```

```typescript
// Chargement de données sécurisé avec React Query
const { data, isLoading } = useQuery({
  queryKey: ['user-data', user?.id],
  queryFn: () => fetchUserData(user!.id),
  enabled: isReady && isAuthenticated && !!user?.id, // ⚠️ CRITIQUE
});
```

```typescript
// Protection de routes
import AuthGuard from '@/components/auth/AuthGuard';

const AdminPage = () => (
  <AuthGuard requireAuth={true} requireRole="admin">
    <AdminDashboard />
  </AuthGuard>
);
```

## 🔄 MIGRATION RAPIDE

```typescript
// AVANT (problématique)
const { user, isLoading: authLoading } = useAuth();

// APRÈS ✅ (bulletproof)
const { user, profile } = useAuth();
const { isAuthenticated, isReady } = useAuthStatus();

// Remplacements globaux :
// authLoading → !isReady
// enabled: !!user → enabled: isReady && isAuthenticated && !!user?.id
// if (user) → if (isReady && isAuthenticated && user)
```

## ⚠️ ADAPTATIONS PROJET

1. **Chemins :**
   - `@/lib/supabase` → votre chemin Supabase
   - `@/services/authService` → vos services auth

2. **Base de données :**
   - `'profiles'` → votre table de profils
   - Rôles utilisateur selon votre logique

3. **UI :**
   - `toast.success` → votre système de notifications
   - Classes CSS des spinners

4. **Wrapper App.tsx :**
```typescript
<AuthProvider>
  <YourApp />
</AuthProvider>
```

## ✅ RÉSULTAT GARANTI

- ✅ Session stable sans flash
- ✅ Race conditions éliminées  
- ✅ Synchronisation cross-tab automatique
- ✅ Types TypeScript stricts
- ✅ Performance optimisée
- ✅ Architecture maintenable

## 🚀 VALIDATION

```bash
npx tsc --noEmit --skipLibCheck  # Vérifier types
npm run build                   # Build production
```

*Système testé et validé en production !* 🛡️ 