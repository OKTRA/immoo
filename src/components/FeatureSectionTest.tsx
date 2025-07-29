import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const FeatureSectionTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const featureKeys = [
    'propertyManagement',
    'tenantManagement', 
    'paymentTracking',
    'contractGeneration',
    'analytics',
    'leaseManagement',
    'agencyProfile',
    'searchFilters',
    'responsiveInterface'
  ];

  const sectionKeys = [
    'sectionTitle',
    'sectionSubtitle',
    'ctaTitle',
    'ctaSubtitle',
    'ctaButton',
    'dialogTitle'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Test FeatureSection - Traductions</CardTitle>
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
                  features.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`features.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Titles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Titres des Fonctionnalités</h4>
            <Button 
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              variant="outline"
              size="sm"
            >
              {showAllFeatures ? 'Masquer' : 'Afficher'} toutes
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureKeys.slice(0, showAllFeatures ? featureKeys.length : 6).map((key) => (
              <div key={key} className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  features.{key}:
                </div>
                <div className="text-sm text-gray-900 mb-2">
                  {t(`features.${key}`)}
                </div>
                <div className="text-xs text-gray-600">
                  {t(`features.${key}Desc`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="font-medium mb-2">{t('features.sectionTitle')}</p>
          <p className="text-sm text-gray-600">{t('features.sectionSubtitle')}</p>
        </div>

        {/* Quick Test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <h5 className="font-medium mb-1">Property Management</h5>
            <p className="text-sm text-gray-600">{t('features.propertyManagement')}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <h5 className="font-medium mb-1">Analytics</h5>
            <p className="text-sm text-gray-600">{t('features.analytics')}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <h5 className="font-medium mb-1">CTA Button</h5>
            <p className="text-sm text-gray-600">{t('features.ctaButton')}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions de Test</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changez la langue via le sélecteur de langue</li>
            <li>• Vérifiez que tous les textes se traduisent correctement</li>
            <li>• Testez les titres et descriptions des fonctionnalités</li>
            <li>• Vérifiez les textes de section et CTA</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};