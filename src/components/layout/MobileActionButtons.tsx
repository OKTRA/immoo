import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { toast } from 'sonner';

export default function MobileActionButtons() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleAccountClick = () => {
    if (profile?.role === 'agency') {
      navigate('/my-agencies');
    } else {
      navigate('/profile');
    }
  };

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    console.log('MobileActionButtons: Changing to language:', newLanguage);
    changeLanguageAndNavigate(newLanguage as any);
    toast.success(`Langue changée vers ${newLanguage === 'fr' ? 'Français' : 'English'}`);
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Bouton Langue - Toggle FR/EN */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleLanguageToggle}
        className="h-9 w-12 px-2 rounded-full hover:bg-immoo-pearl/60 transition-all duration-200 hover:scale-105 shadow-sm font-semibold"
        title={`Basculer vers ${currentLanguage === 'fr' ? 'English' : 'Français'}`}
      >
        <span className="text-xs text-immoo-navy font-bold">
          {currentLanguage === 'fr' ? 'FR' : 'EN'}
        </span>
      </Button>

      {/* Boutons Account et Logout - Seulement si connecté */}
      {user && (
        <>
          {/* Bouton Account */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleAccountClick}
            className="h-9 w-9 p-0 rounded-full hover:bg-immoo-pearl/60 transition-all duration-200 hover:scale-105 shadow-sm"
            title={profile?.role === 'agency' ? 'Mes Agences' : 'Mon Profil'}
          >
            <User className="h-4 w-4 text-immoo-navy" />
          </Button>

          {/* Bouton Logout */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="h-9 w-9 p-0 rounded-full hover:bg-red-50 transition-all duration-200 hover:scale-105 shadow-sm border border-transparent hover:border-red-200"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4 text-red-500 hover:text-red-600" />
          </Button>
        </>
      )}
    </div>
  );
}
