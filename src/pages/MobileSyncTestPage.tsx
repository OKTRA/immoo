import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MobileSyncDiagnostic } from '@/components/debug/MobileSyncDiagnostic';
import { useMobileSync, useMobileTableSync, useNetworkStatus, useAppState } from '@/hooks/useMobileSync';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Capacitor } from '@capacitor/core';
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Page de test complète pour la synchronisation mobile
 */
export default function MobileSyncTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Hooks de synchronisation
  const mobileSync = useMobileSync();
  const networkStatus = useNetworkStatus();
  const appState = useAppState();
  
  // Test de synchronisation avec une table
  const agenciesSync = useMobileTableSync('agencies', (payload) => {
    console.log('Agencies sync event:', payload);
    addTestResult('agencies_sync', 'success', 'Événement reçu pour la table agencies');
  });
  
  const propertiesSync = useRealtimeSync('properties', (payload) => {
    console.log('Properties sync event:', payload);
    addTestResult('properties_sync', 'success', 'Événement reçu pour la table properties');
  });

  // Fonction pour ajouter un résultat de test
  const addTestResult = (test: string, status: 'success' | 'error' | 'warning', message: string) => {
    const result = {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev.slice(0, 19)]); // Garder seulement les 20 derniers
  };

  // Tests automatiques
  const runAutomaticTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: Détection de plateforme
      addTestResult(
        'platform_detection',
        'success',
        `Plateforme détectée: ${Capacitor.isNativePlatform() ? 'Mobile (Capacitor)' : 'Web (Navigateur)'}`
      );
      
      // Test 2: État réseau
      addTestResult(
        'network_status',
        networkStatus.isOnline ? 'success' : 'error',
        `Réseau: ${networkStatus.isOnline ? 'En ligne' : 'Hors ligne'} (${networkStatus.connectionType})`
      );
      
      // Test 3: État de l'application
      addTestResult(
        'app_state',
        appState.isAppActive ? 'success' : 'warning',
        `Application: ${appState.isAppActive ? 'Active' : 'En arrière-plan'}`
      );
      
      // Test 4: Service de synchronisation mobile
      addTestResult(
        'mobile_sync_service',
        mobileSync.isSyncActive ? 'success' : 'error',
        `Service mobile: ${mobileSync.isSyncActive ? 'Actif' : 'Inactif'}`
      );
      
      // Test 5: Synchronisation des tables
      await new Promise(resolve => setTimeout(resolve, 1000));
      addTestResult(
        'table_sync',
        (agenciesSync.isConnected && propertiesSync.isConnected) ? 'success' : 'warning',
        `Tables: Agencies ${agenciesSync.isConnected ? '✓' : '✗'}, Properties ${propertiesSync.isConnected ? '✓' : '✗'}`
      );
      
      // Test 6: Force resync
      await mobileSync.forceResync();
      addTestResult('force_resync', 'success', 'Resynchronisation forcée terminée');
      
    } catch (error) {
      addTestResult('test_error', 'error', `Erreur lors des tests: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Lancer les tests au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      runAutomaticTests();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-500">Succès</Badge>;
      case 'error': return <Badge variant="destructive">Erreur</Badge>;
      case 'warning': return <Badge variant="secondary">Attention</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        {Capacitor.isNativePlatform() ? (
          <Smartphone className="h-8 w-8 text-blue-500" />
        ) : (
          <Monitor className="h-8 w-8 text-gray-500" />
        )}
        <div>
          <h1 className="text-3xl font-bold">Test de Synchronisation Mobile</h1>
          <p className="text-muted-foreground">
            Diagnostic complet de la synchronisation entre web et mobile
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic principal */}
        <div className="space-y-4">
          <MobileSyncDiagnostic showDetails={true} />
          
          {/* Actions de test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actions de Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={runAutomaticTests}
                disabled={isRunningTests}
                className="w-full"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRunningTests && "animate-spin")} />
                {isRunningTests ? 'Tests en cours...' : 'Relancer les tests'}
              </Button>
              
              <Button 
                onClick={mobileSync.forceResync}
                variant="outline"
                className="w-full"
                disabled={!mobileSync.isOnline}
              >
                <Database className="h-4 w-4 mr-2" />
                Forcer la resynchronisation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Résultats des tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résultats des Tests
              <Badge variant="outline">{testResults.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun test exécuté
                </p>
              ) : (
                testResults.map((result) => (
                  <div key={result.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{result.test}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{result.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Plateforme</h4>
              <div className="flex items-center gap-2">
                {Capacitor.isNativePlatform() ? (
                  <Smartphone className="h-4 w-4 text-blue-500" />
                ) : (
                  <Monitor className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-sm">
                  {Capacitor.isNativePlatform() ? 'Mobile' : 'Web'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Réseau</h4>
              <div className="flex items-center gap-2">
                {networkStatus.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {networkStatus.isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Synchronisation</h4>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  mobileSync.isSyncActive ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm">
                  {mobileSync.isSyncActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Tables</h4>
              <div className="text-sm space-y-1">
                <div>Agencies: {agenciesSync.isConnected ? '✓' : '✗'}</div>
                <div>Properties: {propertiesSync.isConnected ? '✓' : '✗'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}