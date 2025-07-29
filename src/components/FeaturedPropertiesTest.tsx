import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const FeaturedPropertiesTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  const sectionKeys = [
    'subtitle',
    'title',
    'description',
    'exploreAll',
    'loadingError',
    'loadingErrorDesc'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🏠 Test FeaturedPropertiesSection - Traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Language */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Langue actuelle :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
        </div>

        {/* Section Texts */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Textes de Section</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionKeys.map((key) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  featuredPropertiesSection.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`featuredPropertiesSection.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="font-medium mb-2">{t('featuredPropertiesSection.title')}</p>
          <p className="text-sm text-gray-600">{t('featuredPropertiesSection.description')}</p>
        </div>

        {/* Quick Test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <h5 className="font-medium mb-1">Subtitle</h5>
            <p className="text-sm text-gray-600">{t('featuredPropertiesSection.subtitle')}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <h5 className="font-medium mb-1">Title</h5>
            <p className="text-sm text-gray-600">{t('featuredPropertiesSection.title')}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <h5 className="font-medium mb-1">Explore Button</h5>
            <p className="text-sm text-gray-600">{t('featuredPropertiesSection.exploreAll')}</p>
          </div>
        </div>

        {/* Error Messages Test */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Messages d'Erreur</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-700 mb-1">
                Error Title:
              </div>
              <div className="text-sm text-red-900">
                {t('featuredPropertiesSection.loadingError')}
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-700 mb-1">
                Error Description:
              </div>
              <div className="text-sm text-red-900">
                {t('featuredPropertiesSection.loadingErrorDesc')}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions de Test</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changez la langue via le sélecteur de langue</li>
            <li>• Vérifiez que tous les textes se traduisent correctement</li>
            <li>• Testez les titres et descriptions de la section</li>
            <li>• Vérifiez les messages d'erreur</li>
            <li>• Testez le bouton "Explorer toutes les propriétés"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};