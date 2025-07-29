import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const DomainDebug: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
  const location = useLocation();
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
        url: window.location.href,
        pathname: location.pathname,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        localStorage: localStorage.getItem('i18nextLng'),
        sessionStorage: sessionStorage.getItem('i18nextLng'),
        navigatorLanguage: navigator.language,
        navigatorLanguages: navigator.languages,
        timestamp: new Date().toISOString()
      });
    };
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage, i18n, location.pathname]);

  const testDomainDetection = () => {
    addLog('=== DOMAIN DETECTION TEST ===');
    addLog(`Hostname: ${window.location.hostname}`);
    addLog(`Protocol: ${window.location.protocol}`);
    addLog(`Full URL: ${window.location.href}`);
    addLog(`Pathname: ${location.pathname}`);
    addLog(`Current language: ${currentLanguage}`);
    addLog(`i18n.language: ${i18n.language}`);
    addLog(`Navigator language: ${navigator.language}`);
    addLog(`localStorage: ${localStorage.getItem('i18nextLng')}`);
  };

  const forceFrenchForDomain = () => {
    addLog('=== FORCE FRENCH FOR DOMAIN ===');
    
    // Force French for immoo.pro
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
    sessionStorage.setItem('i18nextLng', 'fr');
    
    // If we're on a path that should be French (no /en prefix), ensure we stay there
    if (!location.pathname.startsWith('/en/')) {
      addLog('Already on French path, no redirect needed');
    } else {
      addLog('On English path, should redirect to French');
      // Redirect to French version
      const frenchPath = location.pathname.replace('/en/', '/');
      window.history.replaceState(null, '', frenchPath);
    }
    
    setTimeout(() => {
      addLog(`After force - i18n.language: ${i18n.language}`);
      addLog(`After force - URL: ${window.location.href}`);
    }, 100);
  };

  const clearAllAndReload = () => {
    addLog('=== CLEAR ALL AND RELOAD ===');
    localStorage.removeItem('i18nextLng');
    sessionStorage.removeItem('i18nextLng');
    addLog('Storage cleared, reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const testUrlConstruction = () => {
    addLog('=== URL CONSTRUCTION TEST ===');
    
    const testPaths = ['/', '/pricing', '/browse-agencies', '/search'];
    
    testPaths.forEach(path => {
      const frenchUrl = `${window.location.protocol}//${window.location.hostname}${path}`;
      const englishUrl = `${window.location.protocol}//${window.location.hostname}/en${path}`;
      
      addLog(`French URL for ${path}: ${frenchUrl}`);
      addLog(`English URL for ${path}: ${englishUrl}`);
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🌐 Debug Domaine immoo.pro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">État du Domaine</h4>
            <div className="text-sm space-y-1">
              <div><strong>Hostname:</strong> {debugInfo.hostname}</div>
              <div><strong>Protocol:</strong> {debugInfo.protocol}</div>
              <div><strong>Full URL:</strong> {debugInfo.url}</div>
              <div><strong>Pathname:</strong> {debugInfo.pathname}</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">État de la Langue</h4>
            <div className="text-sm space-y-1">
              <div><strong>currentLanguage:</strong> {debugInfo.currentLanguage}</div>
              <div><strong>i18n.language:</strong> {debugInfo.i18nLanguage}</div>
              <div><strong>localStorage:</strong> {debugInfo.localStorage || 'null'}</div>
              <div><strong>navigator:</strong> {debugInfo.navigatorLanguage}</div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <Button onClick={testDomainDetection} variant="outline" size="sm">
            Test Detection
          </Button>
          <Button onClick={forceFrenchForDomain} variant="default" size="sm">
            🔧 Force Français
          </Button>
          <Button onClick={clearAllAndReload} variant="outline" size="sm">
            🗑️ Clear & Reload
          </Button>
          <Button onClick={testUrlConstruction} variant="outline" size="sm">
            Test URLs
          </Button>
        </div>

        {/* Domain Info */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2">Info Domaine</h4>
          <p className="font-medium">immoo.pro devrait être en français par défaut</p>
          <p className="text-sm text-gray-600">
            immoo.pro/ → Français | immoo.pro/en/ → Anglais
          </p>
        </div>

        {/* Translation Test */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold mb-2">Test de Traduction</h4>
          <p className="font-medium">Titre: {t('hero.title')}</p>
          <p className="font-medium">Footer: {t('footer.by')}</p>
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