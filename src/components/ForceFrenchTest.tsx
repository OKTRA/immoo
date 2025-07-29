import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const ForceFrenchTest: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const forceFrench = async () => {
    setIsLoading(true);
    setResult('Forçage du français...');
    
    try {
      console.log('=== FORCE FRENCH TEST ===');
      console.log('Before:', {
        currentLanguage,
        i18nLanguage: i18n.language,
        localStorage: localStorage.getItem('i18nextLng'),
        url: window.location.pathname
      });

      // Step 1: Change i18n language
      await i18n.changeLanguage('fr');
      
      // Step 2: Update localStorage
      localStorage.setItem('i18nextLng', 'fr');
      
      // Step 3: Update sessionStorage
      sessionStorage.setItem('i18nextLng', 'fr');
      
      // Step 4: Force URL to root (French default)
      if (window.location.pathname.startsWith('/en/')) {
        const newPath = window.location.pathname.replace('/en/', '/');
        window.history.replaceState(null, '', newPath);
      }

      console.log('After:', {
        currentLanguage,
        i18nLanguage: i18n.language,
        localStorage: localStorage.getItem('i18nextLng'),
        url: window.location.pathname
      });

      setResult('✅ Français forcé avec succès !');
      
      // Force reload after a delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error forcing French:', error);
      setResult('❌ Erreur lors du forçage du français');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = () => {
    setIsLoading(true);
    setResult('Réinitialisation...');
    
    // Clear all language settings
    localStorage.removeItem('i18nextLng');
    sessionStorage.removeItem('i18nextLng');
    
    // Force reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🇫🇷 Force Français</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current State */}
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">État actuel :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
          <p className="text-xs text-gray-500">
            i18n: {i18n.language} | localStorage: {localStorage.getItem('i18nextLng') || 'null'}
          </p>
        </div>

        {/* Test Translation */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Test de traduction :</p>
          <p className="font-medium">{t('hero.title')}</p>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={forceFrench}
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            {isLoading ? '⏳ Forçage...' : '🔧 Forcer Français'}
          </Button>
          
          <Button 
            onClick={resetToDefault}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            🔄 Réinitialiser
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className={`p-3 rounded-lg text-center ${
            result.includes('✅') ? 'bg-green-50 text-green-800' : 
            result.includes('❌') ? 'bg-red-50 text-red-800' : 
            'bg-blue-50 text-blue-800'
          }`}>
            {result}
          </div>
        )}

        {/* Debug Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>URL: {window.location.pathname}</div>
          <div>Navigator: {navigator.language}</div>
          <div>localStorage: {localStorage.getItem('i18nextLng') || 'null'}</div>
          <div>sessionStorage: {sessionStorage.getItem('i18nextLng') || 'null'}</div>
        </div>
      </CardContent>
    </Card>
  );
};