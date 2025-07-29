import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from './ui/button';

export const SimpleFrenchTest: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();

  const switchToFrench = () => {
    console.log('=== SIMPLE FRENCH TEST ===');
    console.log('Before change:');
    console.log('- currentLanguage:', currentLanguage);
    console.log('- i18n.language:', i18n.language);
    console.log('- localStorage:', localStorage.getItem('i18nextLng'));
    
    // Simple direct change
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
    
    console.log('After change:');
    console.log('- i18n.language:', i18n.language);
    console.log('- localStorage:', localStorage.getItem('i18nextLng'));
    
    // Force a re-render
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-bold mb-2">🇫🇷 Test Simple Français</h3>
      <div className="text-sm space-y-1 mb-3">
        <div>currentLanguage: <strong>{currentLanguage}</strong></div>
        <div>i18n.language: <strong>{i18n.language}</strong></div>
        <div>localStorage: <strong>{localStorage.getItem('i18nextLng') || 'null'}</strong></div>
        <div>Traduction: <strong>{t('hero.title')}</strong></div>
      </div>
      <Button onClick={switchToFrench} size="sm">
        🔧 Forcer Français
      </Button>
    </div>
  );
};