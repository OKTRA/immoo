import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export const I18nTestComponent: React.FC = () => {
  const { 
    t, 
    currentLanguage, 
    changeLanguage, 
    formatNumber, 
    formatCurrency, 
    formatDate, 
    formatRelativeTime 
  } = useTranslation();

  const testDate = new Date();
  const testNumber = 1234567.89;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('common.language')} Test</span>
          <LanguageSwitcher />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Language Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current Language: {currentLanguage}</h3>
          <div className="flex gap-2">
            <Button 
              variant={currentLanguage === 'fr' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => changeLanguage('fr')}
            >
              Français
            </Button>
            <Button 
              variant={currentLanguage === 'en' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => changeLanguage('en')}
            >
              English
            </Button>
          </div>
        </div>

        {/* Translation Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Common Translations:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Loading:</strong> {t('common.loading')}</div>
              <div><strong>Success:</strong> {t('common.success')}</div>
              <div><strong>Error:</strong> {t('common.error')}</div>
              <div><strong>Save:</strong> {t('common.save')}</div>
              <div><strong>Cancel:</strong> {t('common.cancel')}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Navigation:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Home:</strong> {t('navigation.home')}</div>
              <div><strong>Properties:</strong> {t('navigation.properties')}</div>
              <div><strong>Agencies:</strong> {t('navigation.agencies')}</div>
              <div><strong>Login:</strong> {t('navigation.login')}</div>
              <div><strong>Dashboard:</strong> {t('navigation.dashboard')}</div>
            </div>
          </div>
        </div>

        {/* Formatting Examples */}
        <div className="space-y-2">
          <h4 className="font-medium">Formatting Examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Number:</strong> {formatNumber(testNumber)}
            </div>
            <div>
              <strong>Currency:</strong> {formatCurrency(testNumber)}
            </div>
            <div>
              <strong>Date:</strong> {formatDate(testDate)}
            </div>
          </div>
        </div>

        {/* Hero Section Test */}
        <div className="space-y-2">
          <h4 className="font-medium">Hero Section:</h4>
          <div className="text-sm space-y-1">
            <div><strong>Title:</strong> {t('hero.title')}</div>
            <div><strong>Badge:</strong> {t('hero.badge')}</div>
            <div><strong>Search Placeholder:</strong> {t('hero.searchPlaceholder')}</div>
          </div>
        </div>

        {/* Auth Section Test */}
        <div className="space-y-2">
          <h4 className="font-medium">Auth Section:</h4>
          <div className="text-sm space-y-1">
            <div><strong>Login:</strong> {t('auth.login')}</div>
            <div><strong>Sign Up:</strong> {t('auth.signup')}</div>
            <div><strong>Email Required:</strong> {t('auth.emailRequired')}</div>
          </div>
        </div>

        {/* Time Formatting */}
        <div className="space-y-2">
          <h4 className="font-medium">Time Formatting:</h4>
          <div className="text-sm space-y-1">
            <div><strong>Just Now:</strong> {t('common.justNow')}</div>
            <div><strong>5 minutes ago:</strong> {t('common.minutesAgo', { count: 5 })}</div>
            <div><strong>2 hours ago:</strong> {t('common.hoursAgo', { count: 2 })}</div>
            <div><strong>3 days ago:</strong> {t('common.daysAgo', { count: 3 })}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 