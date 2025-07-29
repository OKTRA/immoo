import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const FrenchLanguageDebug: React.FC = () => {
  const { t, currentLanguage, i18n, changeLanguage } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        currentLanguage,
        i18nLanguage: i18n.language,
        localStorage: localStorage.getItem('i18nextLng'),
        availableLanguages: i18n.languages,
        resolvedLanguage: i18n.resolvedLanguage,
        isInitialized: i18n.isInitialized,
        hasResourceBundle: i18n.hasResourceBundle('fr', 'translation'),
        hasResourceBundleEn: i18n.hasResourceBundle('en', 'translation'),
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    };
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage, i18n]);

  const testDirectChange = () => {
    addLog('=== TEST DIRECT CHANGE ===');
    addLog(`Before: i18n.language = ${i18n.language}`);
    addLog(`Before: currentLanguage = ${currentLanguage}`);
    addLog(`Before: localStorage = ${localStorage.getItem('i18nextLng')}`);
    
    // Test direct change
    i18n.changeLanguage('fr');
    
    setTimeout(() => {
      addLog(`After: i18n.language = ${i18n.language}`);
      addLog(`After: localStorage = ${localStorage.getItem('i18nextLng')}`);
    }, 100);
  };

  const testHookChange = () => {
    addLog('=== TEST HOOK CHANGE ===');
    addLog(`Before: i18n.language = ${i18n.language}`);
    addLog(`Before: currentLanguage = ${currentLanguage}`);
    
    // Test hook change
    changeLanguage('fr');
    
    setTimeout(() => {
      addLog(`After: i18n.language = ${i18n.language}`);
      addLog(`After: currentLanguage = ${currentLanguage}`);
    }, 100);
  };

  const testNavigationChange = () => {
    addLog('=== TEST NAVIGATION CHANGE ===');
    addLog(`Before: i18n.language = ${i18n.language}`);
    addLog(`Before: URL = ${window.location.pathname}`);
    
    // Test navigation change
    changeLanguageAndNavigate('fr');
    
    setTimeout(() => {
      addLog(`After: i18n.language = ${i18n.language}`);
      addLog(`After: URL = ${window.location.pathname}`);
    }, 200);
  };

  const forceFrench = () => {
    addLog('=== FORCE FRENCH ===');
    
    // Force all settings
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
    
    // Force reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const clearAll = () => {
    addLog('=== CLEAR ALL ===');
    localStorage.removeItem('i18nextLng');
    sessionStorage.removeItem('i18nextLng');
    window.location.reload();
  };

  const checkInitialization = () => {
    addLog('=== CHECK INITIALIZATION ===');
    addLog(`i18n.isInitialized: ${i18n.isInitialized}`);
    addLog(`i18n.language: ${i18n.language}`);
    addLog(`i18n.resolvedLanguage: ${i18n.resolvedLanguage}`);
    addLog(`i18n.languages: ${i18n.languages?.join(', ')}`);
    addLog(`localStorage: ${localStorage.getItem('i18nextLng')}`);
    addLog(`sessionStorage: ${sessionStorage.getItem('i18nextLng')}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug Sélection Français</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">État Actuel</h4>
            <div className="text-sm space-y-1">
              <div><strong>currentLanguage:</strong> {debugInfo.currentLanguage}</div>
              <div><strong>i18n.language:</strong> {debugInfo.i18nLanguage}</div>
              <div><strong>localStorage:</strong> {debugInfo.localStorage || 'null'}</div>
              <div><strong>resolvedLanguage:</strong> {debugInfo.resolvedLanguage}</div>
              <div><strong>isInitialized:</strong> {debugInfo.isInitialized ? '✅' : '❌'}</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">Ressources</h4>
            <div className="text-sm space-y-1">
              <div><strong>FR bundle:</strong> {debugInfo.hasResourceBundle ? '✅' : '❌'}</div>
              <div><strong>EN bundle:</strong> {debugInfo.hasResourceBundleEn ? '✅' : '❌'}</div>
              <div><strong>Available:</strong> {debugInfo.availableLanguages?.join(', ')}</div>
              <div><strong>URL:</strong> {debugInfo.url}</div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button onClick={testDirectChange} variant="outline" size="sm">
            Test Direct i18n
          </Button>
          <Button onClick={testHookChange} variant="outline" size="sm">
            Test Hook Change
          </Button>
          <Button onClick={testNavigationChange} variant="outline" size="sm">
            Test Navigation
          </Button>
          <Button onClick={checkInitialization} variant="outline" size="sm">
            Check Init
          </Button>
          <Button onClick={forceFrench} variant="default" size="sm">
            🔧 Force Français
          </Button>
          <Button onClick={clearAll} variant="destructive" size="sm">
            🗑️ Clear All
          </Button>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="text-lg font-medium">{t('hero.title')}</p>
          <p className="text-sm text-gray-600">Langue actuelle: {currentLanguage}</p>
        </div>

        {/* Logs */}
        <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
          <h4 className="font-semibold mb-2">Logs de Debug</h4>
          {logs.length === 0 ? (
            <p className="text-xs text-gray-500">Aucun log disponible</p>
          ) : (
            <div className="text-xs space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-gray-700 font-mono">{log}</div>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={() => setLogs([])}
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