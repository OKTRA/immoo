import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ImmoAgencyTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  const serviceKeys = [
    'propertyManagement',
    'rentalSale',
    'financialOptimization',
    'marketingServices'
  ];

  const advantageKeys = [
    'localExpertise',
    'qualifiedNetwork',
    'guaranteedPerformance',
    'totalTransparency'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🏢 Test ImmoAgencyPage - Traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Language */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Langue actuelle :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Section Hero</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Badge:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.badge')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.heroTitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Sous-titre:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.heroSubtitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Description:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.heroDescription')}</div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre section:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.servicesTitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Sous-titre section:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.servicesSubtitle')}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceKeys.map((key) => (
              <div key={key} className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {t(`immoAgency.services.${key}.title`)}:
                </div>
                <div className="text-sm text-gray-900 mb-2">
                  {t(`immoAgency.services.${key}.description`)}
                </div>
                <div className="text-xs text-gray-600">
                  {t(`immoAgency.services.${key}.features`, { returnObjects: true })?.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Avantages</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre section:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.advantagesTitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Sous-titre section:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.advantagesSubtitle')}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advantageKeys.map((key) => (
              <div key={key} className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {t(`immoAgency.advantages.${key}.title`)}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`immoAgency.advantages.${key}.description`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Partenariat</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.partnershipTitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Sous-titre:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.partnershipSubtitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre avantages:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.partnershipBenefitsTitle')}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Réseau national:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.nationalNetwork')}</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Call to Action</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.ctaTitle')}</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Description:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.ctaDescription')}</div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Formulaire de Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Titre:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.contactForm.title')}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Nom complet:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.contactForm.fullName')}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Email:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.contactForm.email')}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Téléphone:</div>
              <div className="text-sm text-gray-900">{t('immoAgency.contactForm.phone')}</div>
            </div>
          </div>
        </div>

        {/* Property Card */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Cartes de Propriétés</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Chambres:</div>
              <div className="text-sm text-gray-900">{t('propertyCard.bedrooms')}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Salles de bain:</div>
              <div className="text-sm text-gray-900">{t('propertyCard.bathrooms')}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Voir détails:</div>
              <div className="text-sm text-gray-900">{t('propertyCard.viewDetails')}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions de Test</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changez la langue via le sélecteur de langue</li>
            <li>• Vérifiez que tous les textes se traduisent correctement</li>
            <li>• Testez les sections Hero, Services, Avantages, Partenariat</li>
            <li>• Vérifiez le formulaire de contact</li>
            <li>• Testez les cartes de propriétés</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};