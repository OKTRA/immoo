import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const LanguageTestComponent: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();

  const handleLanguageChange = (language: 'fr' | 'en') => {
    console.log('=== LANGUAGE CHANGE DEBUG ===');
    console.log('Current language before change:', currentLanguage);
    console.log('i18n.language before change:', i18n.language);
    console.log('Changing to:', language);
    
    changeLanguageAndNavigate(language);
    
    // Check after a short delay
    setTimeout(() => {
      console.log('Current language after change:', currentLanguage);
      console.log('i18n.language after change:', i18n.language);
      console.log('localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
    }, 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test de Changement de Langue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Langue actuelle :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
          <p className="text-xs text-gray-500">i18n.language: {i18n.language}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleLanguageChange('fr')}
            variant={currentLanguage === 'fr' ? 'default' : 'outline'}
            className="flex-1"
          >
            🇫🇷 Français
          </Button>
          <Button 
            onClick={() => handleLanguageChange('en')}
            variant={currentLanguage === 'en' ? 'default' : 'outline'}
            className="flex-1"
          >
            🇺🇸 English
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Test de traduction :</p>
          <p className="font-medium">{t('hero.title')}</p>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>localStorage: {localStorage.getItem('i18nextLng') || 'null'}</p>
          <p>URL: {window.location.pathname}</p>
        </div>
      </CardContent>
    </Card>
  );
};