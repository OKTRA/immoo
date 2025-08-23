import { User } from '@supabase/supabase-js';

// États d'authentification possibles
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Profil utilisateur étendu
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'agency' | 'owner' | 'public' | 'visiteur';
  agency_id?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// État d'authentification complet
export interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean; // Important pour éviter les race conditions
}

// Actions du reducer d'authentification
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: User; profile: UserProfile } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile };

// Interface du contexte d'authentification
export interface AuthContextType {
  // État
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Utilitaires de rôles
  hasRole: (role: string) => boolean;
  isAgency: () => boolean;
  isAdmin: () => boolean;
  isOwner: () => boolean;
  isPublic: () => boolean;
  getUserRole: () => string;
  hasPermission: (permission: string) => boolean;
} 