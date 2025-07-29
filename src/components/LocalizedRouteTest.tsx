import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const LocalizedRouteTest: React.FC = () => {
  const location = useLocation();
  const { currentLanguage, changeLanguage } = useTranslation();
  const { navigateToLocalized, currentPathWithoutLanguage } = useLocalizedNavigation();

  const testRoutes = [
    '/',
    '/browse-agencies',
    '/pricing',
    '/search',
    '/i18n-test'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test des Routes Localisées</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations actuelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Informations actuelles :</h3>
            <div className="text-sm space-y-1">
              <div><strong>URL actuelle :</strong> {location.pathname}</div>
              <div><strong>Langue actuelle :</strong> {currentLanguage}</div>
              <div><strong>Chemin sans langue :</strong> {currentPathWithoutLanguage}</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Changer de langue :</h3>
            <div className="space-y-2">
              <Button 
                onClick={() => changeLanguage('fr')}
                variant={currentLanguage === 'fr' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
              >
                🇫🇷 Français
              </Button>
              <Button 
                onClick={() => changeLanguage('en')}
                variant={currentLanguage === 'en' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
              >
                🇺🇸 English
              </Button>
            </div>
          </div>
        </div>

        {/* Test des routes */}
        <div>
          <h3 className="font-semibold mb-4">Test des routes localisées :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testRoutes.map((route) => (
              <div key={route} className="flex gap-2">
                <Button
                  onClick={() => navigateToLocalized(route, 'fr')}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  🇫🇷 {route}
                </Button>
                <Button
                  onClick={() => navigateToLocalized(route, 'en')}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  🇺🇸 {route}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions de test :</h3>
          <div className="text-sm space-y-1">
            <div>1. Changez la langue de votre navigateur (Chrome: Settings → Languages)</div>
            <div>2. Rechargez la page - vous devriez être redirigé automatiquement</div>
            <div>3. Testez les boutons ci-dessus pour naviguer entre les langues</div>
            <div>4. Vérifiez que l'URL change correctement (ex: /en/pricing pour l'anglais)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 