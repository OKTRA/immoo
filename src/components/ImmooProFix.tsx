import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const ImmooProFix: React.FC = () => {
  const { t, currentLanguage, i18n } = useTranslation();
  const location = useLocation();
  const [status, setStatus] = useState<string>('En attente...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    // Check if we're on immoo.pro domain
    const isImmooPro = window.location.hostname === 'immoo.pro' || 
                      window.location.hostname === 'www.immoo.pro' ||
                      window.location.hostname === 'localhost';
    
    if (isImmooPro) {
      addLog(`🌐 Domaine détecté: ${window.location.hostname}`);
      
      // If we're on root path and not in French, force French
      if ((location.pathname === '/' || location.pathname === '') && i18n.language !== 'fr') {
        addLog('🔧 Forçage du français pour immoo.pro');
        setStatus('Application du français...');
        
        // Force French
        i18n.changeLanguage('fr');
        localStorage.setItem('i18nextLng', 'fr');
        sessionStorage.setItem('i18nextLng', 'fr');
        
        setTimeout(() => {
          addLog('✅ Français appliqué avec succès');
          setStatus('Français appliqué');
        }, 100);
      } else {
        addLog(`✅ Langue déjà correcte: ${i18n.language}`);
        setStatus('Configuration correcte');
      }
    } else {
      addLog(`⚠️ Domaine non reconnu: ${window.location.hostname}`);
      setStatus('Domaine non reconnu');
    }
  }, [location.pathname, i18n.language, i18n]);

  const forceFrenchNow = () => {
    addLog('🔧 Forçage manuel du français');
    setStatus('Forçage en cours...');
    
    // Force French
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
    sessionStorage.setItem('i18nextLng', 'fr');
    
    // If on English path, redirect to French
    if (location.pathname.startsWith('/en/')) {
      const frenchPath = location.pathname.replace('/en/', '/');
      window.history.replaceState(null, '', frenchPath);
      addLog(`🔄 Redirection vers: ${frenchPath}`);
    }
    
    setTimeout(() => {
      addLog('✅ Français forcé avec succès');
      setStatus('Français forcé');
    }, 100);
  };

  const clearAndReload = () => {
    addLog('🗑️ Nettoyage et rechargement');
    setStatus('Nettoyage...');
    
    localStorage.removeItem('i18nextLng');
    sessionStorage.removeItem('i18nextLng');
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const testUrlPatterns = () => {
    addLog('🧪 Test des patterns d\'URL');
    
    const testUrls = [
      'https://immoo.pro/',
      'https://immoo.pro/pricing',
      'https://immoo.pro/en/',
      'https://immoo.pro/en/pricing',
      'https://www.immoo.pro/',
      'https://www.immoo.pro/en/'
    ];
    
    testUrls.forEach(url => {
      const urlObj = new URL(url);
      const isEnglish = urlObj.pathname.startsWith('/en');
      const expectedLang = isEnglish ? 'en' : 'fr';
      addLog(`${url} → ${expectedLang.toUpperCase()}`);
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🌐 Fix immoo.pro - Français par Défaut</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status */}
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Statut :</p>
          <p className="text-lg font-bold text-blue-800">{status}</p>
        </div>

        {/* Domain Info */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Domaine actuel :</p>
          <p className="font-medium">{window.location.hostname}</p>
          <p className="text-xs text-gray-500 mt-1">
            immoo.pro → Français | immoo.pro/en → Anglais
          </p>
        </div>

        {/* Current State */}
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">État actuel :</p>
          <p className="font-medium">
            {currentLanguage === 'fr' ? '🇫🇷 Français' : '🇺🇸 English'}
          </p>
          <p className="text-xs text-gray-500">
            i18n: {i18n.language} | localStorage: {localStorage.getItem('i18nextLng') || 'null'}
          </p>
        </div>

        {/* Test Translation */}
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Test de traduction :</p>
          <p className="font-medium">{t('hero.title')}</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button 
            onClick={forceFrenchNow}
            variant="default"
            size="sm"
            className="w-full"
          >
            🔧 Forcer Français
          </Button>
          
          <Button 
            onClick={clearAndReload}
            variant="outline"
            size="sm"
            className="w-full"
          >
            🗑️ Clear & Reload
          </Button>
          
          <Button 
            onClick={testUrlPatterns}
            variant="outline"
            size="sm"
            className="w-full"
          >
            🧪 Test URLs
          </Button>
        </div>

        {/* Logs */}
        <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded">
          <h4 className="font-semibold mb-2 text-sm">Logs</h4>
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