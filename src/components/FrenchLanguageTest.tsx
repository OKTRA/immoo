import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const FrenchLanguageTest: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFrenchSelection = () => {
    addLog('=== TESTING FRENCH SELECTION ===');
    addLog(`Current language: ${currentLanguage}`);
    addLog(`i18n.language: ${i18n.language}`);
    addLog(`Current URL: ${window.location.pathname}`);
    addLog(`localStorage: ${localStorage.getItem('i18nextLng')}`);
    
    // Test direct i18n change
    addLog('Testing direct i18n.changeLanguage("fr")...');
    i18n.changeLanguage('fr');
    
    setTimeout(() => {
      addLog(`After direct change - i18n.language: ${i18n.language}`);
      addLog(`After direct change - localStorage: ${localStorage.getItem('i18nextLng')}`);
    }, 100);
  };

  const testFrenchNavigation = () => {
    addLog('=== TESTING FRENCH NAVIGATION ===');
    addLog(`Current URL: ${window.location.pathname}`);
    
    // Test the navigation function
    changeLanguageAndNavigate('fr');
    
    setTimeout(() => {
      addLog(`After navigation - URL: ${window.location.pathname}`);
      addLog(`After navigation - i18n.language: ${i18n.language}`);
    }, 200);
  };

  const forceFrench = () => {
    addLog('=== FORCING FRENCH ===');
    
    // Force all French settings
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
    
    // Force navigation to root
    window.location.href = '/';
  };

  const clearAndReload = () => {
    addLog('=== CLEARING AND RELOADING ===');
    localStorage.removeItem('i18nextLng');
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🇫🇷 Test Spécifique Français</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">État actuel :</p>
          <p className="text-lg font-bold">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
          <p className="text-xs text-gray-500">i18n.language: {i18n.language}</p>
          <p className="text-xs text-gray-500">URL: {window.location.pathname}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testFrenchSelection}
            variant="outline"
            size="sm"
          >
            Test i18n Direct
          </Button>
          <Button 
            onClick={testFrenchNavigation}
            variant="outline"
            size="sm"
          >
            Test Navigation
          </Button>
          <Button 
            onClick={forceFrench}
            variant="default"
            size="sm"
          >
            🔧 Force Français
          </Button>
          <Button 
            onClick={clearAndReload}
            variant="destructive"
            size="sm"
          >
            🗑️ Clear & Reload
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Test de traduction :</p>
          <p className="font-medium">{t('hero.title')}</p>
        </div>
        
        <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
          <h4 className="text-sm font-semibold mb-2">Logs de test :</h4>
          {testResults.length === 0 ? (
            <p className="text-xs text-gray-500">Aucun test effectué</p>
          ) : (
            <div className="text-xs space-y-1">
              {testResults.map((log, index) => (
                <div key={index} className="text-gray-700">{log}</div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => setTestResults([])}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Logs
        </Button>
      </CardContent>
    </Card>
  );
};