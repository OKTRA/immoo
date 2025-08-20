import React, { useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { useMobileToast } from '@/hooks/useMobileToast';

export default function MobileActionButtons() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();
  const mobileToast = useMobileToast();

  // Écouter l'événement de déconnexion pour redirection automatique
  useEffect(() => {
    const handleAuthStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'signout' && event.detail.shouldRedirect) {
        navigate('/');
      }
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      mobileToast.success('Déconnexion réussie', {}, true); // Essentiel
      // La redirection sera gérée par l'événement auth-state-changed
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      mobileToast.error('Erreur lors de la déconnexion');
    }
  };

  const handleAccountClick = () => {
    if (profile?.role === 'agency') {
      navigate('/my-agencies');
    }
    // Suppression de la navigation vers /profile pour les autres utilisateurs
  };

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    console.log('MobileActionButtons: Changing to language:', newLanguage);
    changeLanguageAndNavigate(newLanguage as any);
    // Toast de changement de langue désactivé sur mobile (non essentiel)
    mobileToast.success(`Langue changée vers ${newLanguage === 'fr' ? 'Français' : 'English'}`);
  };

  return (
    <div className="mobile-flex-center mobile-space-x-tight">
      {/* Bouton Langue - Toggle FR/EN */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleLanguageToggle}
        className="h-8 w-10 px-1.5 rounded-full hover:bg-immoo-pearl/60 transition-all duration-200 hover:scale-105 shadow-sm font-semibold"
        title={`Basculer vers ${currentLanguage === 'fr' ? 'English' : 'Français'}`}
      >
        <span className="text-xs text-immoo-navy font-bold">
          {currentLanguage === 'fr' ? 'FR' : 'EN'}
        </span>
      </Button>

      {/* Boutons Account et Logout - Seulement pour les utilisateurs d'agence */}
      {user && profile?.role === 'agency' && (
        <>
          {/* Bouton Account */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleAccountClick}
            className="h-8 w-8 p-0 rounded-full hover:bg-immoo-pearl/60 transition-all duration-200 hover:scale-105 shadow-sm"
            title="Mes Agences"
          >
            <User className="h-4 w-4 text-immoo-navy" />
          </Button>

          {/* Bouton Logout */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 p-0 rounded-full hover:bg-red-50 transition-all duration-200 hover:scale-105 shadow-sm border border-transparent hover:border-red-200"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4 text-red-500 hover:text-red-600" />
          </Button>
        </>
      )}
    </div>
  );
}
