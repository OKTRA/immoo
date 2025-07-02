import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile, signInWithEmail, signUpWithEmail, signOut as authSignOut } from '@/services/authService';
import { AuthContextType, UserProfile } from '@/types/auth';
import { authReducer, initialAuthState } from './authReducer';
import { toast } from 'sonner';

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const initialized = useRef(false);
  const authListenerRef = useRef<any>(null);

  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      const { profile, error } = await getUserProfile(user.id);
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Fonction pour initialiser l'authentification
  const initializeAuth = useCallback(async () => {
    if (initialized.current) return;

    try {
      console.log('🔄 Initializing auth...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Récupérer la session existante
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return;
      }

      if (session?.user) {
        console.log('✅ Session found, fetching profile...');
        const profile = await fetchUserProfile(session.user);
        
        if (profile) {
          console.log('✅ Profile loaded:', profile.role);
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: { user: session.user, profile }
          });
        } else {
          console.log('❌ Profile not found, signing out...');
          await authSignOut();
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      } else {
        console.log('ℹ️ No session found');
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to initialize authentication' });
    } finally {
      initialized.current = true;
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      console.log('🏁 Auth initialization complete');
    }
  }, [fetchUserProfile]);

  // Fonction de connexion
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔑 Signing in...', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { user, session, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.error('❌ Sign in error:', error);
        dispatch({ type: 'SET_ERROR', payload: error });
        return { success: false, error };
      }

      if (user) {
        console.log('✅ User signed in, fetching profile...');
        const profile = await fetchUserProfile(user);
        
        if (profile) {
          console.log('✅ Profile loaded after sign in:', profile.role);
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: { user, profile }
          });
          toast.success('Connexion réussie !');
          return { success: true };
        } else {
          console.error('❌ Profile not found after sign in');
          dispatch({ type: 'SET_ERROR', payload: 'Profil utilisateur non trouvé' });
          return { success: false, error: 'Profil utilisateur non trouvé' };
        }
      }

      return { success: false, error: 'Échec de la connexion' };
    } catch (error: any) {
      console.error('❌ Sign in exception:', error);
      const errorMessage = error.message || 'Erreur lors de la connexion';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [fetchUserProfile]);

  // Fonction d'inscription
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      console.log('📝 Signing up...', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { user, session } = await signUpWithEmail(email, password, userData);

      if (user) {
        console.log('✅ User signed up, fetching profile...');
        const profile = await fetchUserProfile(user);
        
        if (profile) {
          console.log('✅ Profile loaded after sign up:', profile.role);
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: { user, profile }
          });
          toast.success('Inscription réussie !');
          return { success: true };
        }
      }

      console.log('ℹ️ Sign up successful, awaiting email confirmation');
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      toast.info('Vérifiez votre email pour confirmer votre inscription.');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign up exception:', error);
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [fetchUserProfile]);

  // Fonction de déconnexion
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Signing out...');
      dispatch({ type: 'SET_LOADING', payload: true });
      await authSignOut();
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      toast.success('Déconnexion réussie');
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      dispatch({ type: 'SET_UNAUTHENTICATED' });
    }
  }, []);

  // Fonction pour rafraîchir l'authentification
  const refreshAuth = useCallback(async () => {
    if (!state.user) return;
    
    try {
      console.log('🔄 Refreshing auth...');
      const profile = await fetchUserProfile(state.user);
      if (profile) {
        dispatch({ type: 'UPDATE_PROFILE', payload: profile });
        console.log('✅ Auth refreshed');
      }
    } catch (error) {
      console.error('❌ Error refreshing auth:', error);
    }
  }, [state.user, fetchUserProfile]);

  // Fonction pour mettre à jour le profil
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.profile) return;

    try {
      console.log('🔄 Updating profile...', updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.profile.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_PROFILE',
        payload: { ...state.profile, ...updates }
      });
      
      toast.success('Profil mis à jour avec succès');
      console.log('✅ Profile updated');
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  }, [state.profile]);

  // Fonctions utilitaires
  const hasRole = useCallback((role: string): boolean => {
    return state.profile?.role === role;
  }, [state.profile]);

  const isAgency = useCallback((): boolean => {
    return state.profile?.role === 'agency';
  }, [state.profile]);

  const isAdmin = useCallback((): boolean => {
    return state.profile?.role === 'admin';
  }, [state.profile]);

  // Initialiser l'authentification au montage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listener pour les changements d'état d'authentification
  useEffect(() => {
    if (!initialized.current) return;

    if (authListenerRef.current) {
      authListenerRef.current.subscription.unsubscribe();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);

        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Auth listener: User signed in');
          const profile = await fetchUserProfile(session.user);
          if (profile) {
            dispatch({
              type: 'SET_AUTHENTICATED',
              payload: { user: session.user, profile }
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('ℹ️ Auth listener: User signed out');
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Auth listener: Token refreshed');
          const profile = await fetchUserProfile(session.user);
          if (profile) {
            dispatch({
              type: 'SET_AUTHENTICATED',
              payload: { user: session.user, profile }
            });
          }
        }
      }
    );

    authListenerRef.current = authListener;

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  // Synchronisation cross-tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token') {
        console.log('🔄 Cross-tab auth change detected');
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeAuth]);

  const contextValue: AuthContextType = {
    status: state.status,
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    initialized: state.initialized,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    updateProfile,
    hasRole,
    isAgency,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 