import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const TranslationDebug: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
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
        resolvedLanguage: i18n.resolvedLanguage,
        isInitialized: i18n.isInitialized,
        hasResourceBundle: i18n.hasResourceBundle('fr', 'translation'),
        hasResourceBundleEn: i18n.hasResourceBundle('en', 'translation'),
        footerByFr: i18n.t('footer.by', { lng: 'fr' }),
        footerByEn: i18n.t('footer.by', { lng: 'en' }),
        footerByCurrent: i18n.t('footer.by'),
        footerByHook: t('footer.by'),
        timestamp: new Date().toISOString()
      });
    };
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage, i18n, t]);

  const testFooterTranslation = () => {
    addLog('=== TEST FOOTER TRANSLATION ===');
    addLog(`Current language: ${currentLanguage}`);
    addLog(`i18n.language: ${i18n.language}`);
    addLog(`i18n.resolvedLanguage: ${i18n.resolvedLanguage}`);
    
    // Test direct translations
    addLog(`i18n.t('footer.by', { lng: 'fr' }): ${i18n.t('footer.by', { lng: 'fr' })}`);
    addLog(`i18n.t('footer.by', { lng: 'en' }): ${i18n.t('footer.by', { lng: 'en' })}`);
    addLog(`i18n.t('footer.by'): ${i18n.t('footer.by')}`);
    addLog(`t('footer.by'): ${t('footer.by')}`);
    
    // Test resource bundles
    addLog(`Has FR bundle: ${i18n.hasResourceBundle('fr', 'translation')}`);
    addLog(`Has EN bundle: ${i18n.hasResourceBundle('en', 'translation')}`);
    
    // Test missing key
    addLog(`Missing key test: ${i18n.t('footer.by', { lng: 'fr' })}`);
  };

  const forceFrenchAndTest = () => {
    addLog('=== FORCE FRENCH AND TEST ===');
    
    // Force French
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
    
    setTimeout(() => {
      addLog(`After force French - i18n.language: ${i18n.language}`);
      addLog(`After force French - t('footer.by'): ${t('footer.by')}`);
      addLog(`After force French - i18n.t('footer.by'): ${i18n.t('footer.by')}`);
    }, 100);
  };

  const checkResourceBundles = () => {
    addLog('=== CHECK RESOURCE BUNDLES ===');
    
    // Check what's in the bundles
    const frBundle = i18n.getResourceBundle('fr', 'translation');
    const enBundle = i18n.getResourceBundle('en', 'translation');
    
    addLog(`FR bundle footer.by: ${frBundle?.footer?.by || 'NOT FOUND'}`);
    addLog(`EN bundle footer.by: ${enBundle?.footer?.by || 'NOT FOUND'}`);
    addLog(`FR bundle keys: ${Object.keys(frBundle || {}).join(', ')}`);
    addLog(`EN bundle keys: ${Object.keys(enBundle || {}).join(', ')}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug Traduction footer.by</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">État Actuel</h4>
            <div className="text-sm space-y-1">
              <div><strong>currentLanguage:</strong> {debugInfo.currentLanguage}</div>
              <div><strong>i18n.language:</strong> {debugInfo.i18nLanguage}</div>
              <div><strong>resolvedLanguage:</strong> {debugInfo.resolvedLanguage}</div>
              <div><strong>isInitialized:</strong> {debugInfo.isInitialized ? '✅' : '❌'}</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">Traductions footer.by</h4>
            <div className="text-sm space-y-1">
              <div><strong>FR direct:</strong> {debugInfo.footerByFr}</div>
              <div><strong>EN direct:</strong> {debugInfo.footerByEn}</div>
              <div><strong>Current i18n:</strong> {debugInfo.footerByCurrent}</div>
              <div><strong>Hook t():</strong> {debugInfo.footerByHook}</div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button onClick={testFooterTranslation} variant="outline" size="sm">
            Test Footer Translation
          </Button>
          <Button onClick={forceFrenchAndTest} variant="outline" size="sm">
            Force French & Test
          </Button>
          <Button onClick={checkResourceBundles} variant="outline" size="sm">
            Check Resource Bundles
          </Button>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction Footer</h4>
          <p className="font-medium">footer.by: {t('footer.by')}</p>
          <p className="font-medium">footer.madeWith: {t('footer.madeWith')}</p>
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