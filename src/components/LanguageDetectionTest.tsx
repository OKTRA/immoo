import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const LanguageDetectionTest: React.FC = () => {
  const location = useLocation();
  const { currentLanguage, i18n } = useTranslation();
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && ['fr', 'en'].includes(pathSegments[0])) {
      setDetectedLanguage(pathSegments[0]);
    } else {
      setDetectedLanguage('fr (default)');
    }
  }, [location.pathname]);

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>🔍 Test de Détection de Langue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <strong>URL actuelle:</strong><br />
            {location.pathname}
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <strong>Langue détectée dans l'URL:</strong><br />
            {detectedLanguage}
          </div>
          <div className="p-3 bg-green-50 rounded">
            <strong>Langue actuelle de l'app:</strong><br />
            {currentLanguage}
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <strong>Langue i18n:</strong><br />
            {i18n.language}
          </div>
        </div>
        
        <div className="p-3 bg-red-50 rounded text-sm">
          <strong>Test de traduction:</strong><br />
          <div>🇫🇷 Français: {i18n.t('common.home')}</div>
          <div>🇺🇸 English: {i18n.t('common.home', { lng: 'en' })}</div>
        </div>

        <div className="text-xs text-gray-600">
          <strong>Instructions:</strong><br />
          1. Visitez /en/ pour voir si la langue change automatiquement<br />
          2. Visitez / pour revenir au français<br />
          3. Vérifiez que les traductions changent
        </div>
      </CardContent>
    </Card>
  );
};