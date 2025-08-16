import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { handleGoogleAuthCallback, extractGoogleUserData } from '@/services/googleAuthService';
import { getCurrentUser } from '@/services/authService';
import { checkUserHasAgency } from '@/services/agency/agencyBasicService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Vérification de votre connexion...');

        // Vérifier si c'est un nouvel utilisateur Google
        const result = await handleGoogleAuthCallback();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        const isNewUser = result.isNewUser;
        
        // Pour tous les utilisateurs (nouveaux et existants), vérifier s'ils ont une agence
        const session = await getCurrentUser();
        if (!session?.user?.id) {
          throw new Error('Session utilisateur non trouvée après authentification');
        }
        
        const { hasAgency, error: agencyCheckError } = await checkUserHasAgency(session.user.id);
        
        if (agencyCheckError) {
          console.error('Erreur lors de la vérification de l\'agence:', agencyCheckError);
          // Traiter comme un utilisateur sans agence plutôt qu'une erreur technique
          console.log('🚫 Erreur de vérification agence, traitement comme utilisateur sans agence');
        }
        
        if (!hasAgency || agencyCheckError) {
          // Utilisateur sans agence - déconnecter et rediriger vers création d'agence
          console.log('🚫 Utilisateur sans agence détecté, déconnexion et redirection');
          setStatus('success');
          
          if (isNewUser) {
            toast.success('Connexion Google réussie !', {
              description: 'Vous devez maintenant créer votre profil d\'agence pour accéder à la plateforme.'
            });
          } else {
            toast.info('Profil agence requis', {
              description: 'Vous devez créer un profil d\'agence pour accéder à la plateforme.'
            });
          }
          
          // Déconnecter immédiatement l'utilisateur
          await signOut();
          
          // Petit délai pour s'assurer que l'état d'authentification est propagé
          setTimeout(() => {
            // Rediriger vers la page de création d'agence avec un flag
            navigate('/immo-agency?from=auth&needsAgency=true');
          }, 100);
        } else {
          // Utilisateur avec agence - rediriger vers ses agences
          console.log('✅ Utilisateur avec agence, redirection vers /my-agencies');
          setStatus('success');
          navigate('/my-agencies');
        }
      } catch (error: any) {
        console.error('Error in Google auth callback:', error);
        setStatus('error');
        setMessage('Une erreur inattendue s\'est produite');
        toast.error('Erreur de connexion', {
          description: 'Une erreur inattendue s\'est produite',
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Connexion en cours...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Connexion réussie !
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Erreur de connexion
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Retour à la connexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
