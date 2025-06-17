import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VisitorMiniLogin from '@/components/visitor/VisitorMiniLogin';
import VisitorConnectionStatus from '@/components/visitor/VisitorConnectionStatus';
import { useVisitorSession } from '@/hooks/useVisitorSession';

export default function TestVisitorSession() {
  const [showMiniLogin, setShowMiniLogin] = useState(false);
  const { session, isConnected, isLoading, logout } = useVisitorSession();

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Session Visiteur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">État de la session :</h3>
              <ul className="text-sm space-y-1">
                <li>Connecté: {isConnected ? '✅ Oui' : '❌ Non'}</li>
                <li>Chargement: {isLoading ? '⏳ Oui' : '✅ Non'}</li>
                <li>Session ID: {session?.session_id || 'Aucune'}</li>
                <li>Email: {session?.email || 'Non défini'}</li>
                <li>Téléphone: {session?.phone || 'Non défini'}</li>
                <li>Nom: {session?.name || 'Non défini'}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Actions de test :</h3>
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowMiniLogin(true)}
                  disabled={isConnected}
                  className="w-full"
                >
                  Ouvrir Mini Login
                </Button>
                
                <Button 
                  onClick={logout}
                  disabled={!isConnected}
                  variant="destructive"
                  className="w-full"
                >
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
          
          {/* Status Component */}
          {isConnected && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Composant de statut :</h3>
              <VisitorConnectionStatus />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Data Debug */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Données de session (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Mini Login Dialog */}
      <VisitorMiniLogin
        isOpen={showMiniLogin}
        onClose={() => setShowMiniLogin(false)}
        onSuccess={() => {
          setShowMiniLogin(false);
          console.log('✅ Mini login success in test page');
        }}
        agencyName="Agence de Test"
      />
    </div>
  );
} 