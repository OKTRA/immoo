import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { I18nTestComponent } from '@/components/ui/I18nTestComponent';
import { LocalizedRouteTest } from '@/components/LocalizedRouteTest';
import { LanguageTestComponent } from '@/components/LanguageTestComponent';
import { I18nDebugComponent } from '@/components/I18nDebugComponent';
import { FrenchLanguageTest } from '@/components/FrenchLanguageTest';
import { SimpleFrenchTest } from '@/components/SimpleFrenchTest';
import { FrenchLanguageDebug } from '@/components/FrenchLanguageDebug';
import { ForceFrenchTest } from '@/components/ForceFrenchTest';
import { TranslationDebug } from '@/components/TranslationDebug';
import { DomainDebug } from '@/components/DomainDebug';
import { ImmooProFix } from '@/components/ImmooProFix';
import { FeatureSectionTest } from '@/components/FeatureSectionTest';
import { FeaturedPropertiesTest } from '@/components/FeaturedPropertiesTest';
import { ImmoAgencyTest } from '@/components/ImmoAgencyTest';
import { PropertyCardTest } from '@/components/PropertyCardTest';
import { AuthFormsTest } from '@/components/AuthFormsTest';
import { AgenciesPagesTest } from '@/components/AgenciesPagesTest';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Languages, Route, CheckCircle } from 'lucide-react';

export default function I18nTestPage() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { navigateToLocalized } = useLocalizedNavigation();

  const testPages = [
    { path: '/', name: 'Home' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/browse-agencies', name: 'Browse Agencies' },
    { path: '/search', name: 'Search' }
  ];

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🌍 Test de l'Internationalisation (i18n)
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Testez le système de traduction et de routes localisées d'IMMOO
            </p>
          </div>

          {/* Agencies Pages Test */}
          <AgenciesPagesTest />

          {/* Auth Forms Test */}
          <AuthFormsTest />

          {/* Property Card Test */}
          <PropertyCardTest />

          {/* Immo Agency Test */}
          <ImmoAgencyTest />

          {/* Featured Properties Test */}
          <FeaturedPropertiesTest />

          {/* Feature Section Test */}
          <FeatureSectionTest />

          {/* Immoo Pro Fix */}
          <ImmooProFix />

          {/* Domain Debug */}
          <DomainDebug />

          {/* Translation Debug */}
          <TranslationDebug />

          {/* Force French Test */}
          <ForceFrenchTest />

          {/* French Language Debug */}
          <FrenchLanguageDebug />

          {/* Simple French Test */}
          <SimpleFrenchTest />

          {/* French Language Test */}
          <FrenchLanguageTest />

          {/* Debug Component */}
          <I18nDebugComponent />

          {/* Language Test Component */}
          <LanguageTestComponent />

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4" />
                  Langue actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Code: {currentLanguage}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Languages className="w-4 h-4" />
                  Traductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ✅ Actives
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  FR + EN disponibles
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Route className="w-4 h-4" />
                  Routes localisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ✅ Actives
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  /en/* pour l'anglais
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ✅ Opérationnel
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Prêt pour la production
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation Test */}
          <Card>
            <CardHeader>
              <CardTitle>Test de Navigation Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {testPages.map((page) => (
                  <div key={page.path} className="space-y-2">
                    <Button
                      onClick={() => navigateToLocalized(page.path, 'fr')}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      🇫🇷 {page.name}
                    </Button>
                    <Button
                      onClick={() => navigateToLocalized(page.path, 'en')}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      🇺🇸 {page.name}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Component Tests */}
          <I18nTestComponent />

          {/* Route Tests */}
          <LocalizedRouteTest />

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions de Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">🌐 Test des Langues</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Changez la langue via le sélecteur</li>
                    <li>• Vérifiez que l'URL se met à jour</li>
                    <li>• Testez la détection automatique</li>
                    <li>• Vérifiez la persistance localStorage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔗 Test des Routes</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Naviguez vers /en/* pour l'anglais</li>
                    <li>• Naviguez vers /* pour le français</li>
                    <li>• Testez les redirections automatiques</li>
                    <li>• Vérifiez les liens internes</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Changez la langue de votre navigateur pour tester la détection automatique</li>
                  <li>• Utilisez les boutons de navigation pour tester les routes localisées</li>
                  <li>• Vérifiez que le contenu change bien selon la langue</li>
                  <li>• Testez sur mobile et desktop</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
} 