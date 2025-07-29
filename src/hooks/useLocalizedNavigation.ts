import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from './useTranslation';
import { SupportedLanguage } from '@/i18n';

export const useLocalizedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage, i18n } = useTranslation();

  // Get the current path without language prefix
  const getPathWithoutLanguage = useCallback((path: string) => {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length > 0 && ['fr', 'en'].includes(pathSegments[0])) {
      return '/' + pathSegments.slice(1).join('/');
    }
    return path;
  }, []);

  // Get the current path with language prefix
  const getPathWithLanguage = useCallback((path: string, language?: SupportedLanguage) => {
    const lang = language || currentLanguage;
    const cleanPath = getPathWithoutLanguage(path);
    
    // Don't add prefix for French (default language)
    if (lang === 'fr') {
      return cleanPath;
    }
    
    // Add language prefix for other languages
    return `/${lang}${cleanPath}`;
  }, [currentLanguage, getPathWithoutLanguage]);

  // Navigate to a localized route
  const navigateToLocalized = useCallback((path: string, language?: SupportedLanguage) => {
    const localizedPath = getPathWithLanguage(path, language);
    navigate(localizedPath);
  }, [navigate, getPathWithLanguage]);

  // Change language and update URL
  const changeLanguageAndNavigate = useCallback((language: SupportedLanguage) => {
    console.log('=== LANGUAGE CHANGE DEBUG ===');
    console.log('Current language before change:', currentLanguage);
    console.log('i18n.language before change:', i18n.language);
    console.log('Changing to:', language);
    console.log('Current URL:', location.pathname);
    
    // First change the i18n language
    i18n.changeLanguage(language);
    
    // Get current path without language prefix
    const currentPath = getPathWithoutLanguage(location.pathname);
    console.log('Current path without language:', currentPath);
    
    // Navigate to the localized version
    const newPath = getPathWithLanguage(currentPath, language);
    console.log('Navigating to:', newPath);
    
    // Use replace to avoid adding to browser history
    navigate(newPath, { replace: true });
    
    // Log after navigation
    setTimeout(() => {
      console.log('Language change completed');
      console.log('New i18n.language:', i18n.language);
      console.log('New URL:', window.location.pathname);
      console.log('localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
    }, 100);
  }, [i18n, location.pathname, getPathWithoutLanguage, getPathWithLanguage, navigate, currentLanguage]);

  // Get current path without language prefix
  const currentPathWithoutLanguage = getPathWithoutLanguage(location.pathname);

  return {
    navigateToLocalized,
    changeLanguageAndNavigate,
    getPathWithLanguage,
    getPathWithoutLanguage,
    currentPathWithoutLanguage,
    currentLanguage
  };
}; 