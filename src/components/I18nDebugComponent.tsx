import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export const I18nDebugComponent: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        currentLanguage,
        i18nLanguage: i18n.language,
        localStorage: localStorage.getItem('i18nextLng'),
        availableLanguages: i18n.languages,
        resolvedLanguage: i18n.resolvedLanguage,
        isInitialized: i18n.isInitialized,
        hasResourceBundle: i18n.hasResourceBundle('fr', 'translation'),
        hasResourceBundleEn: i18n.hasResourceBundle('en', 'translation'),
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage, i18n]);

  const forceLanguageChange = (language: 'fr' | 'en') => {
    console.log('Force changing language to:', language);
    
    // Direct i18n change
    i18n.changeLanguage(language);
    
    // Update localStorage
    localStorage.setItem('i18nextLng', language);
    
    // Force reload if needed
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Debug i18n</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">État actuel :</h4>
            <div className="text-sm space-y-1">
              <div><strong>currentLanguage:</strong> {debugInfo.currentLanguage}</div>
              <div><strong>i18n.language:</strong> {debugInfo.i18nLanguage}</div>
              <div><strong>localStorage:</strong> {debugInfo.localStorage || 'null'}</div>
              <div><strong>resolvedLanguage:</strong> {debugInfo.resolvedLanguage}</div>
              <div><strong>isInitialized:</strong> {debugInfo.isInitialized ? '✅' : '❌'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Ressources :</h4>
            <div className="text-sm space-y-1">
              <div><strong>FR bundle:</strong> {debugInfo.hasResourceBundle ? '✅' : '❌'}</div>
              <div><strong>EN bundle:</strong> {debugInfo.hasResourceBundleEn ? '✅' : '❌'}</div>
              <div><strong>Available:</strong> {debugInfo.availableLanguages?.join(', ')}</div>
              <div><strong>URL:</strong> {debugInfo.url}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => forceLanguageChange('fr')}
            variant="outline"
            size="sm"
          >
            🔧 Force FR
          </Button>
          <Button 
            onClick={() => forceLanguageChange('en')}
            variant="outline"
            size="sm"
          >
            🔧 Force EN
          </Button>
          <Button 
            onClick={() => {
              localStorage.removeItem('i18nextLng');
              window.location.reload();
            }}
            variant="outline"
            size="sm"
          >
            🗑️ Clear localStorage
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>Dernière mise à jour : {debugInfo.timestamp}</p>
        </div>
      </CardContent>
    </Card>
  );
};