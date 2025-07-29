import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthFormsTest: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  const quickVisitorKeys = [
    'title',
    'description',
    'placeholder',
    'cancel',
    'access',
    'connecting',
    'success',
    'error',
    'unknownError'
  ];

  const agencyKeys = [
    'title',
    'subtitle',
    'email',
    'emailPlaceholder',
    'password',
    'passwordPlaceholder',
    'login',
    'connecting',
    'emailRequired',
    'passwordRequired',
    'invalidCredentials',
    'unknownError',
    'loginFailed',
    'noAgencyYet',
    'createAgency'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔐 Test Formulaires d'Authentification - Traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Language */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Langue actuelle :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
        </div>

        {/* Quick Visitor Login Translations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Accès Rapide (QuickVisitorLogin)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickVisitorKeys.map((key) => (
              <div key={key} className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  auth.quickVisitor.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`auth.quickVisitor.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Login Translations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Connexion Agence (AgencyLoginForm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agencyKeys.map((key) => (
              <div key={key} className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  auth.agency.{key}:
                </div>
                <div className="text-sm text-gray-900">
                  {t(`auth.agency.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Quick Visitor Form */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Exemple - Formulaire d'Accès Rapide</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{t('auth.quickVisitor.title')}</h3>
                <button className="text-gray-400">✕</button>
              </div>
              
              <p className="text-sm text-gray-600">
                {t('auth.quickVisitor.description')}
              </p>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder={t('auth.quickVisitor.placeholder')}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                
                <div className="flex gap-2">
                  <button className="flex-1 p-2 border border-gray-300 rounded">
                    {t('auth.quickVisitor.cancel')}
                  </button>
                  <button className="flex-1 p-2 bg-blue-600 text-white rounded">
                    {t('auth.quickVisitor.access')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Agency Login Form */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Exemple - Formulaire de Connexion Agence</h4>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  🏢
                </div>
                <h2 className="text-xl font-bold">{t('auth.agency.title')}</h2>
                <p className="text-sm text-gray-600">{t('auth.agency.subtitle')}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.agency.email')}
                  </label>
                  <input 
                    type="email" 
                    placeholder={t('auth.agency.emailPlaceholder')}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.agency.password')}
                  </label>
                  <input 
                    type="password" 
                    placeholder={t('auth.agency.passwordPlaceholder')}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <button className="w-full p-2 bg-blue-600 text-white rounded">
                  {t('auth.agency.login')}
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                {t('auth.agency.noAgencyYet')}{' '}
                <button className="text-blue-600 underline">
                  {t('auth.agency.createAgency')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="font-medium mb-2">{t('auth.quickVisitor.title')} • {t('auth.agency.title')}</p>
          <p className="text-sm text-gray-600">
            {t('auth.quickVisitor.access')} • {t('auth.agency.login')} • {t('auth.agency.email')}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions de Test</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changez la langue via le sélecteur de langue</li>
            <li>• Vérifiez que tous les textes se traduisent correctement</li>
            <li>• Testez le formulaire d'accès rapide (QuickVisitorLogin)</li>
            <li>• Testez le formulaire de connexion agence (AgencyLoginForm)</li>
            <li>• Vérifiez les messages d'erreur et de succès</li>
            <li>• Testez les placeholders et labels</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};