import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AgenciesPagesTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  const browseAgenciesKeys = [
    'title',
    'subtitle',
    'loading.title',
    'loading.description',
    'results.found',
    'results.foundPlural',
    'results.for',
    'search.placeholder',
    'search.filters',
    'search.sortBy',
    'search.sortByName',
    'search.sortByRating',
    'search.sortByRecent',
    'search.sortByProperties',
    'search.location',
    'search.allRegions',
    'search.bamako',
    'search.sikasso',
    'search.segou',
    'search.mopti',
    'search.minRating',
    'search.allRatings',
    'search.stars4',
    'search.stars3',
    'search.stars2',
    'search.resetFilters',
    'noResults.title',
    'noResults.noAgencies',
    'noResults.searchDescription',
    'noResults.noAgenciesDescription',
    'noResults.suggestions',
    'noResults.createAgency.title',
    'noResults.createAgency.description',
    'noResults.createAgency.button',
    'noResults.features.title',
    'noResults.features.location.title',
    'noResults.features.location.description',
    'noResults.features.quality.title',
    'noResults.features.quality.description',
    'noResults.features.expertise.title',
    'noResults.features.expertise.description'
  ];

  const publicAgencyKeys = [
    'notFound.title',
    'notFound.description',
    'certified',
    'stats.rating',
    'stats.properties',
    'stats.propertiesPlural',
    'stats.experience',
    'stats.experiencePlural',
    'contact.title',
    'contact.description',
    'contact.phone',
    'contact.email',
    'contact.website',
    'contact.noContact',
    'specialties.title',
    'specialties.description',
    'properties.title',
    'properties.description',
    'properties.noProperties.title',
    'properties.noProperties.description'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🏢 Test Pages d'Agences - Traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Language */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Langue actuelle :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
        </div>

        {/* Browse Agencies Translations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Parcourir les Agences (BrowseAgenciesPage)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {browseAgenciesKeys.map((key) => (
              <div key={key} className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  browseAgencies.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`browseAgencies.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Agency Translations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Agence Publique (PublicAgencyPage)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicAgencyKeys.map((key) => (
              <div key={key} className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  publicAgency.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`publicAgency.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Browse Agencies Page */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Exemple - Page Parcourir les Agences</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('browseAgencies.title')}
                </h1>
                <p className="text-gray-600">
                  {t('browseAgencies.subtitle')}
                </p>
              </div>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder={t('browseAgencies.search.placeholder')}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded">
                    {t('browseAgencies.search.filters')}
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded">
                    {t('browseAgencies.search.sortBy')}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  {t('browseAgencies.results.for')} "test" • {t('browseAgencies.results.found')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Public Agency Page */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Exemple - Page Agence Publique</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {t('publicAgency.certified')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('publicAgency.stats.rating')} • {t('publicAgency.stats.properties')} • {t('publicAgency.stats.experience')}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <h2 className="font-semibold text-gray-900">
                    {t('publicAgency.contact.title')}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t('publicAgency.contact.description')}
                  </p>
                </div>
                
                <div className="flex gap-2 text-sm">
                  <span>{t('publicAgency.contact.phone')}</span>
                  <span>{t('publicAgency.contact.email')}</span>
                  <span>{t('publicAgency.contact.website')}</span>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">
                    {t('publicAgency.specialties.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('publicAgency.specialties.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">
                    {t('publicAgency.properties.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('publicAgency.properties.description')} Test Agency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="font-medium mb-2">{t('browseAgencies.title')} • {t('publicAgency.certified')}</p>
          <p className="text-sm text-gray-600">
            {t('browseAgencies.search.filters')} • {t('publicAgency.contact.title')} • {t('publicAgency.stats.rating')}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions de Test</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changez la langue via le sélecteur de langue</li>
            <li>• Vérifiez que tous les textes se traduisent correctement</li>
            <li>• Testez la page /en/browse-agencies</li>
            <li>• Testez la page /en/public-agency/[id]</li>
            <li>• Vérifiez les messages d'erreur et de chargement</li>
            <li>• Testez les filtres et la recherche</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};