import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Types pour l'API Electron
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      navigate: (path: string) => void;
      onNavigate: (callback: (event: any, path: string) => void) => void;
      onAuthSuccess: (callback: (event: any, userData: any) => void) => void;
      sendAuthSuccess: (userData: any) => void;
      isElectron: boolean;
      platform: string;
    };
    isElectronApp?: boolean;
  }
}

export const ElectronIntegration: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Vérifier si nous sommes dans Electron
    if (!window.electronAPI) {
      console.log('Application web - Electron non détecté');
      return;
    }

    console.log('Application Electron détectée');

    // Écouter les événements de navigation depuis le menu Electron
    const handleNavigation = (event: CustomEvent) => {
      const path = event.detail;
      console.log('Navigation Electron vers:', path);
      navigate(path);
    };

    // Écouter les événements d'authentification réussie
    const handleAuthSuccess = (event: CustomEvent) => {
      const userData = event.detail;
      console.log('Authentification réussie dans Electron:', userData);
      // Rediriger vers /my-agencies après connexion
      navigate('/my-agencies');
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('electron-navigate', handleNavigation as EventListener);
    window.addEventListener('electron-auth-success', handleAuthSuccess as EventListener);

    // Nettoyer les écouteurs
    return () => {
      window.removeEventListener('electron-navigate', handleNavigation as EventListener);
      window.removeEventListener('electron-auth-success', handleAuthSuccess as EventListener);
    };
  }, [navigate]);

  // Envoyer les informations d'authentification à Electron quand l'utilisateur se connecte
  useEffect(() => {
    if (window.electronAPI && user && profile) {
      console.log('Utilisateur connecté dans Electron:', { user, profile });
      // Vous pouvez envoyer des informations à Electron si nécessaire
      // window.electronAPI.sendAuthSuccess({ user, profile });
    }
  }, [user, profile]);

  return null; // Ce composant ne rend rien visuellement
};

// Hook pour détecter si nous sommes dans Electron
export const useElectron = () => {
  return {
    isElectron: !!window.electronAPI,
    platform: window.electronAPI?.platform || 'web',
    getAppVersion: window.electronAPI?.getAppVersion,
    getAppName: window.electronAPI?.getAppName
  };
};

// Hook pour la navigation Electron
export const useElectronNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    if (window.electronAPI) {
      window.electronAPI.navigate(path);
    } else {
      navigate(path);
    }
  };

  return { navigateTo };
}; 