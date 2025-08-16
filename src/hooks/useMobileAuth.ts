import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { mobileAuthService } from '@/services/mobileAuthService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthState {
  user: any;
  session: any;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface MobileAuthHook {
  authState: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  platformInfo: any;
}

/**
 * Hook personnalisé pour gérer l'authentification mobile
 * Compatible avec Capacitor et les plateformes web
 */
export const useMobileAuth = (): MobileAuthHook => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  const [platformInfo] = useState(() => mobileAuthService.getPlatformInfo());

  // Fonction pour mettre à jour l'état d'authentification
  const updateAuthState = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await mobileAuthService.checkAuthState();
      
      setAuthState({
        user: result.user,
        session: result.session,
        isLoading: false,
        error: result.error,
        isAuthenticated: !!result.user,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erreur lors de la vérification de l\'authentification',
        isAuthenticated: false,
      }));
    }
  }, []);

  // Fonction de connexion
  const signIn = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await mobileAuthService.signInWithGoogle();
      
      if (result.error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error,
        }));
        toast.error('Erreur de connexion', {
          description: result.error,
        });
        return;
      }

      // Sur mobile, on peut avoir une réponse immédiate
      if (result.user) {
        setAuthState({
          user: result.user,
          session: result.session,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
        toast.success('Connexion réussie!');
      } else {
        // Sur web, l'utilisateur sera redirigé
        setAuthState(prev => ({ ...prev, isLoading: false }));
        toast.success(`Redirection vers Google (${platformInfo.platform})...`);
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erreur de connexion',
      }));
      toast.error('Erreur de connexion', {
        description: error.message,
      });
    }
  }, [platformInfo.platform]);

  // Fonction de déconnexion
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await mobileAuthService.signOut();
      
      if (result.error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error,
        }));
        toast.error('Erreur de déconnexion', {
          description: result.error,
        });
        return;
      }

      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
      
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erreur de déconnexion',
      }));
      toast.error('Erreur de déconnexion', {
        description: error.message,
      });
    }
  }, []);

  // Fonction de rafraîchissement
  const refreshAuth = useCallback(async () => {
    await updateAuthState();
  }, [updateAuthState]);

  // Gestion des événements Capacitor pour mobile
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let appUrlOpenListener: any;
    let appStateChangeListener: any;

    const setupMobileListeners = async () => {
      try {
        // Écouter les ouvertures d'URL (pour les redirections d'authentification)
        appUrlOpenListener = await App.addListener('appUrlOpen', async (event) => {
          console.log('📱 App URL opened:', event.url);
          
          // Vérifier si c'est une URL d'authentification
          if (event.url.includes('auth/callback') || event.url.includes('access_token')) {
            console.log('🔐 Auth callback detected, updating auth state...');
            
            // Attendre un peu pour que Supabase traite la redirection
            setTimeout(async () => {
              await updateAuthState();
            }, 1000);
          }
        });

        // Écouter les changements d'état de l'application
        appStateChangeListener = await App.addListener('appStateChange', async (state) => {
          console.log('📱 App state changed:', state);
          
          // Quand l'app revient au premier plan, vérifier l'état d'authentification
          if (state.isActive) {
            console.log('🔄 App became active, checking auth state...');
            await updateAuthState();
          }
        });
      } catch (error) {
        console.error('Error setting up mobile listeners:', error);
      }
    };

    setupMobileListeners();

    // Nettoyage
    return () => {
      if (appUrlOpenListener) {
        appUrlOpenListener.remove();
      }
      if (appStateChangeListener) {
        appStateChangeListener.remove();
      }
    };
  }, [updateAuthState]);

  // Écouter les changements d'authentification Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Supabase auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            setAuthState({
              user: session?.user || null,
              session,
              isLoading: false,
              error: null,
              isAuthenticated: !!session?.user,
            });
            break;
            
          case 'SIGNED_OUT':
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              error: null,
              isAuthenticated: false,
            });
            break;
            
          case 'TOKEN_REFRESHED':
            setAuthState(prev => ({
              ...prev,
              session,
              user: session?.user || null,
              isAuthenticated: !!session?.user,
            }));
            break;
            
          default:
            // Pour les autres événements, vérifier l'état
            await updateAuthState();
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  // Vérification initiale de l'état d'authentification
  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  return {
    authState,
    signIn,
    signOut,
    refreshAuth,
    platformInfo,
  };
};

/**
 * Hook simplifié pour vérifier uniquement si l'utilisateur est connecté
 */
export const useIsAuthenticated = (): boolean => {
  const { authState } = useMobileAuth();
  return authState.isAuthenticated;
};

/**
 * Hook pour obtenir les informations de l'utilisateur actuel
 */
export const useCurrentUser = () => {
  const { authState } = useMobileAuth();
  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    error: authState.error,
  };
};

export default useMobileAuth;