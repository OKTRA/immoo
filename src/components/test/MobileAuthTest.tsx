import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { mobileAuthService } from '@/services/mobileAuthService';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { FiSmartphone, FiMonitor, FiUser, FiLogOut, FiRefreshCw } from 'react-icons/fi';

interface AuthState {
  user: any;
  session: any;
  error: string | null;
  isLoading: boolean;
}

const MobileAuthTest: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    error: null,
    isLoading: false,
  });
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Obtenir les informations de plateforme
    const info = mobileAuthService.getPlatformInfo();
    setPlatformInfo(info);
    
    // Vérifier l'état d'authentification initial
    checkAuthState();
  }, []);

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const checkAuthState = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await mobileAuthService.checkAuthState();
      setAuthState({
        user: result.user,
        session: result.session,
        error: result.error,
        isLoading: false,
      });
      addTestResult(`État d'auth vérifié: ${result.user ? 'Connecté' : 'Déconnecté'}`);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      addTestResult(`Erreur vérification auth: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await mobileAuthService.signOut();
      if (result.error) {
        toast.error('Erreur de déconnexion', {
          description: result.error,
        });
        addTestResult(`Erreur déconnexion: ${result.error}`);
      } else {
        toast.success('Déconnexion réussie');
        addTestResult('Déconnexion réussie');
        await checkAuthState();
      }
    } catch (error: any) {
      toast.error('Erreur de déconnexion', {
        description: error.message,
      });
      addTestResult(`Erreur déconnexion: ${error.message}`);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAuthSuccess = () => {
    addTestResult('Authentification Google initiée avec succès');
    // Vérifier l'état après un délai pour laisser le temps à la redirection
    setTimeout(() => {
      checkAuthState();
    }, 2000);
  };

  const handleAuthError = (error: string) => {
    addTestResult(`Erreur authentification: ${error}`);
  };

  const testMobileFeatures = async () => {
    addTestResult('Test des fonctionnalités mobiles...');
    
    try {
      // Test 1: Vérification de la plateforme
      const info = mobileAuthService.getPlatformInfo();
      addTestResult(`Plateforme détectée: ${info.platform}`);
      
      // Test 2: Vérification de l'état d'authentification
      await checkAuthState();
      
      // Test 3: Test de compatibilité Capacitor
      if (Capacitor.isNativePlatform()) {
        addTestResult('✅ Capacitor détecté - Mode mobile');
      } else {
        addTestResult('ℹ️ Mode web - Capacitor non détecté');
      }
      
      addTestResult('Tests des fonctionnalités terminés');
    } catch (error: any) {
      addTestResult(`Erreur lors des tests: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Test d'Authentification Mobile</h1>
        <p className="text-muted-foreground">
          Validation de la synchronisation d'authentification entre web et mobile
        </p>
      </div>

      {/* Informations de plateforme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {platformInfo?.isMobile ? <FiSmartphone /> : <FiMonitor />}
            Informations de Plateforme
          </CardTitle>
        </CardHeader>
        <CardContent>
          {platformInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Plateforme</p>
                <Badge variant={platformInfo.isMobile ? 'default' : 'secondary'}>
                  {platformInfo.platform}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Capacitor</p>
                <Badge variant={platformInfo.capacitor ? 'default' : 'outline'}>
                  {platformInfo.capacitor ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium">User Agent</p>
                <p className="text-xs text-muted-foreground break-all">
                  {platformInfo.userAgent}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* État d'authentification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiUser />
            État d'Authentification
          </CardTitle>
          <CardDescription>
            État actuel de la session utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Statut</span>
              <Badge variant={authState.user ? 'default' : 'outline'}>
                {authState.isLoading ? 'Vérification...' : authState.user ? 'Connecté' : 'Déconnecté'}
              </Badge>
            </div>
            
            {authState.user && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm">{authState.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">ID</span>
                    <span className="text-xs font-mono">{authState.user.id}</span>
                  </div>
                  {authState.user.user_metadata && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Nom</span>
                      <span className="text-sm">
                        {authState.user.user_metadata.full_name || 'Non défini'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {authState.error && (
              <>
                <Separator />
                <div className="text-sm text-red-600">
                  <strong>Erreur:</strong> {authState.error}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions d'authentification */}
      <Card>
        <CardHeader>
          <CardTitle>Actions d'Authentification</CardTitle>
          <CardDescription>
            Tester les fonctionnalités d'authentification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!authState.user ? (
              <GoogleAuthButton
                variant="outline"
                size="lg"
                className="w-full"
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                disabled={authState.isLoading}
              />
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleSignOut}
                disabled={authState.isLoading}
              >
                <FiLogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={checkAuthState}
                disabled={authState.isLoading}
                className="flex-1"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Vérifier l'état
              </Button>
              
              <Button
                variant="secondary"
                onClick={testMobileFeatures}
                className="flex-1"
              >
                Tester fonctionnalités
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats des tests */}
      <Card>
        <CardHeader>
          <CardTitle>Journal des Tests</CardTitle>
          <CardDescription>
            Historique des actions et résultats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aucun test effectué
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className="text-sm p-2 bg-muted rounded border-l-2 border-blue-500"
                >
                  {result}
                </div>
              ))
            )}
          </div>
          
          {testResults.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTestResults([])}
              className="mt-2"
            >
              Effacer le journal
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuthTest;