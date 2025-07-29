import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PropertyCardTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  const propertyCardKeys = [
    'bedrooms',
    'bathrooms',
    'rooms',
    'viewDetails',
    'contact',
    'book',
    'fillFormToContact'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🏠 Test PropertyCard - Traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Language */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Langue actuelle :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
        </div>

        {/* Property Card Translations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Traductions des Cartes de Propriétés</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyCardKeys.map((key) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  propertyCard.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`propertyCard.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Property Card */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Exemple de Carte de Propriété</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>🏨</span>
                  <span>3 {t('propertyCard.rooms')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🛏️</span>
                  <span>2 {t('propertyCard.bedrooms')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🚿</span>
                  <span>1 {t('propertyCard.bathrooms')}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
                  👁️ {t('propertyCard.viewDetails')}
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  📞 {t('propertyCard.contact')}
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  📅 {t('propertyCard.book')}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                {t('propertyCard.fillFormToContact')}
              </div>
            </div>
          </div>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="font-medium mb-2">{t('propertyCard.viewDetails')}</p>
          <p className="text-sm text-gray-600">
            {t('propertyCard.bedrooms')} • {t('propertyCard.bathrooms')} • {t('propertyCard.rooms')}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions de Test</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changez la langue via le sélecteur de langue</li>
            <li>• Vérifiez que tous les textes se traduisent correctement</li>
            <li>• Testez les boutons "Voir détails", "Contact", "Réserver"</li>
            <li>• Vérifiez les textes "chambres", "pièces", "SdB"</li>
            <li>• Testez le message de formulaire de contact</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};