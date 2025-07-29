import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';

export const LanguageRedirect: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage, i18n } = useTranslation();
  const { getPathWithLanguage } = useLocalizedNavigation();

  useEffect(() => {
    console.log('🔍 LanguageRedirect - URL changed:', location.pathname);
    console.log('🔍 LanguageRedirect - Current language:', currentLanguage);
    console.log('🔍 LanguageRedirect - i18n.language:', i18n.language);
    console.log('🔍 LanguageRedirect - Hostname:', window.location.hostname);
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    console.log('🔍 LanguageRedirect - Path segments:', pathSegments);
    
    // If we're at the root path, ensure French is set and no redirect needed
    if (location.pathname === '/' || location.pathname === '') {
      console.log('🔍 LanguageRedirect - Root path detected');
      
      // Ensure French is set as default for immoo.pro
      if (i18n.language !== 'fr') {
        console.log('🔍 LanguageRedirect - Setting French as default for root path');
        i18n.changeLanguage('fr');
        localStorage.setItem('i18nextLng', 'fr');
      } else {
        console.log('🔍 LanguageRedirect - French already set, no change needed');
      }
      return;
    }

    // If the first segment is a language code, detect and change language
    if (pathSegments.length > 0 && ['fr', 'en'].includes(pathSegments[0])) {
      const detectedLanguage = pathSegments[0] as 'fr' | 'en';
      console.log('🔍 LanguageRedirect - Language detected in URL:', detectedLanguage);
      
      // If the URL language doesn't match the current i18n language, change it
      if (detectedLanguage !== i18n.language) {
        console.log(`🔍 LanguageRedirect - Changing i18n language from ${i18n.language} to ${detectedLanguage}`);
        i18n.changeLanguage(detectedLanguage);
        localStorage.setItem('i18nextLng', detectedLanguage);
      } else {
        console.log('🔍 LanguageRedirect - Language already matches, no change needed');
      }
    } else {
      console.log('🔍 LanguageRedirect - No language prefix detected, using default (fr)');
      // If no language prefix, ensure French is set
      if (i18n.language !== 'fr') {
        console.log('🔍 LanguageRedirect - Changing to French (default)');
        i18n.changeLanguage('fr');
        localStorage.setItem('i18nextLng', 'fr');
      }
    }
  }, [location.pathname, currentLanguage, i18n.language, navigate, getPathWithLanguage, i18n]);

  return null; // This component doesn't render anything
}; 