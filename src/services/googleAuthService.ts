import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface GoogleAuthResult {
  user: any;
  session: any;
  error: string | null;
  isNewUser: boolean;
}

export interface GoogleUserMetadata {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

// Fonction pour obtenir l'URL de redirection correcte
const getRedirectUrl = (): string => {
  // En production, utiliser l'URL de production définie dans les variables d'environnement
  const productionUrl = import.meta.env.VITE_PRODUCTION_URL;
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment && productionUrl) {
    return `${productionUrl}/auth/callback`;
  }
  
  // En développement ou si pas d'URL de production définie, utiliser l'origine actuelle
  return `${window.location.origin}/auth/callback`;
};

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    console.log('🔐 Initiating Google sign in...');
    
    const redirectUrl = getRedirectUrl();
    console.log('🔗 Redirect URL:', redirectUrl);
    
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
      console.error('Google auth error:', error);
      return {
        user: null,
        session: null,
        error: error.message,
        isNewUser: false,
      };
    }

    // Si pas d'erreur, l'utilisateur sera redirigé vers Google
    return {
      user: null,
      session: null,
      error: null,
      isNewUser: false,
    };
  } catch (error: any) {
    console.error('Unexpected error during Google auth:', error);
    return {
      user: null,
      session: null,
      error: error.message || 'Une erreur inattendue s\'est produite',
      isNewUser: false,
    };
  }
};

export const handleGoogleAuthCallback = async (): Promise<GoogleAuthResult> => {
  try {
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
    const isNewUser = user.created_at === user.last_sign_in_at;

    return {
      user,
      session: data.session,
      error: null,
      isNewUser,
    };
  } catch (error: any) {
    console.error('Error handling Google auth callback:', error);
    return {
      user: null,
      session: null,
      error: error.message || 'Erreur lors de la gestion de la connexion Google',
      isNewUser: false,
    };
  }
};

export const extractGoogleUserData = (user: any): GoogleUserMetadata => {
  try {
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const nameParts = fullName.split(' ').filter(Boolean);
    
    let first_name = '';
    let last_name = '';
    
    if (nameParts.length === 1) {
      first_name = nameParts[0];
    } else if (nameParts.length >= 2) {
      first_name = nameParts[0];
      last_name = nameParts.slice(1).join(' ');
    }

    return {
      first_name: first_name || user.user_metadata?.given_name || '',
      last_name: last_name || user.user_metadata?.family_name || '',
      email: user.email || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    };
  } catch (error) {
    console.error('Error extracting Google user data:', error);
    return {
      first_name: '',
      last_name: '',
      email: user.email || '',
      avatar_url: '',
    };
  }
};

export const checkIfUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user exists:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};
