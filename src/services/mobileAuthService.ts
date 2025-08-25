import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { GoogleAuthResult, GoogleUserMetadata } from './googleAuthService';

/**
 * Service d'authentification spécifique pour les plateformes mobiles
 * Gère les différences entre web et mobile pour l'authentification Google
 */
export class MobileAuthService {
  private static instance: MobileAuthService;
  private isMobile: boolean;

  private constructor() {
    this.isMobile = Capacitor.isNativePlatform();
  }

  public static getInstance(): MobileAuthService {
    if (!MobileAuthService.instance) {
      MobileAuthService.instance = new MobileAuthService();
    }
    return MobileAuthService.instance;
  }

  /**
   * Authentification Google adaptée à la plateforme
   */
  public async signInWithGoogle(): Promise<GoogleAuthResult> {
    try {
      console.log(`🔐 Initiating Google sign in on ${this.isMobile ? 'mobile' : 'web'}...`);
      
      if (this.isMobile) {
        return await this.signInWithGoogleMobile();
      } else {
        return await this.signInWithGoogleWeb();
      }
    } catch (error: any) {
      console.error('Mobile auth error:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Erreur d\'authentification',
        isNewUser: false,
      };
    }
  }

  /**
   * Authentification Google pour mobile (Capacitor)
   */
  private async signInWithGoogleMobile(): Promise<GoogleAuthResult> {
    try {
      // Pour mobile, on utilise une approche différente
      // On peut utiliser le plugin Google Auth de Capacitor si disponible
      // Sinon, on utilise l'approche web avec des paramètres adaptés
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Pour mobile, on utilise une URL de redirection personnalisée
          redirectTo: this.getMobileRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Mobile Google auth error:', error);
        return {
          user: null,
          session: null,
          error: error.message,
          isNewUser: false,
        };
      }

      // Sur mobile, on peut avoir une réponse immédiate
      if (data.session) {
        return {
          user: data.session.user,
          session: data.session,
          error: null,
          isNewUser: this.checkIfNewUser(data.session.user),
        };
      }

      return {
        user: null,
        session: null,
        error: null,
        isNewUser: false,
      };
    } catch (error: any) {
      console.error('Mobile Google auth error:', error);
      return {
        user: null,
        session: null,
        error: error.message,
        isNewUser: false,
      };
    }
  }

  /**
   * Authentification Google pour web
   */
  private async signInWithGoogleWeb(): Promise<GoogleAuthResult> {
    try {
      // Utiliser la même logique de redirection que getMobileRedirectUrl pour le web
      const redirectUrl = this.getMobileRedirectUrl();
      console.log('🔗 Mobile Web Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Web Google auth error:', error);
        return {
          user: null,
          session: null,
          error: error.message,
          isNewUser: false,
        };
      }

      return {
        user: null,
        session: null,
        error: null,
        isNewUser: false,
      };
    } catch (error: any) {
      console.error('Web Google auth error:', error);
      return {
        user: null,
        session: null,
        error: error.message,
        isNewUser: false,
      };
    }
  }

  /**
   * Obtient l'URL de redirection pour mobile
   */
  private getMobileRedirectUrl(): string {
    if (this.isMobile) {
      // Pour Capacitor, on utilise un scheme personnalisé
      return 'pro.immoo.app://auth/callback';
    }
    
    // Pour le web mobile, utiliser la même logique que le service principal
    const productionUrl = import.meta.env.VITE_PRODUCTION_URL;
    const isDevelopment = import.meta.env.DEV;
    
    if (!isDevelopment && productionUrl) {
      return `${productionUrl}/auth/callback`;
    }
    
    return `${window.location.origin}/auth/callback`;
  }

  /**
   * Vérifie si l'utilisateur est nouveau
   */
  private checkIfNewUser(user: any): boolean {
    return user.created_at === user.last_sign_in_at;
  }

  /**
   * Gère le callback d'authentification
   */
  public async handleAuthCallback(): Promise<GoogleAuthResult> {
    try {
      console.log(`🔄 Handling auth callback on ${this.isMobile ? 'mobile' : 'web'}...`);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (!data.session?.user) {
        return {
          user: null,
          session: null,
          error: 'Aucune session trouvée',
          isNewUser: false,
        };
      }

      const user = data.session.user;
      const isNewUser = this.checkIfNewUser(user);

      // Sur mobile, on peut avoir besoin de traitement supplémentaire
      if (this.isMobile) {
        await this.handleMobileAuthSuccess(user);
      }

      return {
        user,
        session: data.session,
        error: null,
        isNewUser,
      };
    } catch (error: any) {
      console.error('Error handling auth callback:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Erreur lors de la gestion de la connexion',
        isNewUser: false,
      };
    }
  }

  /**
   * Traitement spécifique mobile après authentification réussie
   */
  private async handleMobileAuthSuccess(user: any): Promise<void> {
    try {
      // Synchroniser les données utilisateur
      console.log('📱 Mobile auth success, syncing user data...');
      
      // Ici on peut ajouter des traitements spécifiques mobile
      // comme la synchronisation des données hors ligne, etc.
      
    } catch (error) {
      console.error('Error in mobile auth success handler:', error);
    }
  }

  /**
   * Déconnexion adaptée à la plateforme
   */
  public async signOut(): Promise<{ error: string | null }> {
    try {
      console.log(`🚪 Signing out on ${this.isMobile ? 'mobile' : 'web'}...`);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error: error.message };
      }

      // Nettoyage spécifique mobile
      if (this.isMobile) {
        await this.handleMobileSignOut();
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message || 'Erreur lors de la déconnexion' };
    }
  }

  /**
   * Nettoyage spécifique mobile lors de la déconnexion
   */
  private async handleMobileSignOut(): Promise<void> {
    try {
      console.log('📱 Mobile sign out cleanup...');
      
      // Ici on peut ajouter des nettoyages spécifiques mobile
      // comme la suppression des données en cache, etc.
      
    } catch (error) {
      console.error('Error in mobile sign out cleanup:', error);
    }
  }

  /**
   * Vérifie l'état de l'authentification
   */
  public async checkAuthState(): Promise<{ user: any; session: any; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return {
        user: data.session?.user || null,
        session: data.session,
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: error.message || 'Erreur lors de la vérification de l\'état d\'authentification',
      };
    }
  }

  /**
   * Extrait les données utilisateur Google
   */
  public extractGoogleUserData(user: any): GoogleUserMetadata {
    try {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const nameParts = fullName.split(' ');
      
      return {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      };
    } catch (error) {
      console.error('Error extracting Google user data:', error);
      return {
        first_name: '',
        last_name: '',
        email: user.email || '',
        avatar_url: undefined,
      };
    }
  }

  /**
   * Obtient des informations sur la plateforme
   */
  public getPlatformInfo() {
    return {
      isMobile: this.isMobile,
      platform: this.isMobile ? 'mobile' : 'web',
      capacitor: Capacitor.isNativePlatform(),
      userAgent: navigator.userAgent,
    };
  }
}

// Instance singleton
export const mobileAuthService = MobileAuthService.getInstance();

// Fonctions utilitaires pour compatibilité
export const signInWithGoogleMobile = () => mobileAuthService.signInWithGoogle();
export const handleMobileAuthCallback = () => mobileAuthService.handleAuthCallback();
export const signOutMobile = () => mobileAuthService.signOut();
export const checkMobileAuthState = () => mobileAuthService.checkAuthState();
export const extractGoogleUserDataMobile = (user: any) => mobileAuthService.extractGoogleUserData(user);
export const getMobilePlatformInfo = () => mobileAuthService.getPlatformInfo();