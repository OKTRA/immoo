import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickVisitorLogin from '@/components/visitor/QuickVisitorLogin';
import QuickVisitorIndicator from '@/components/visitor/QuickVisitorIndicator';
import { useQuickVisitorAccess, refreshVisitorState, isVisitorLoggedIn } from '@/hooks/useQuickVisitorAccess';

export default function TestVisitorAccess() {
  const [showLogin, setShowLogin] = useState(false);
  const { visitorContact, isLoggedIn, isLoading, logout } = useQuickVisitorAccess();
  const syncLoggedIn = isVisitorLoggedIn();

  const handleLoginSuccess = (visitorData: any) => {
    console.log('✅ Test login successful:', visitorData);
    setShowLogin(false);
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de l'accès visiteur amélioré</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* État de la session */}
          <div>
            <h3 className="font-medium mb-3">État de la session :</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Hook isLoggedIn:</span>
                  <span className={isLoggedIn ? 'text-green-600' : 'text-red-600'}>
                    {isLoggedIn ? '✅ Connecté' : '❌ Non connecté'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sync isLoggedIn:</span>
                  <span className={syncLoggedIn ? 'text-green-600' : 'text-red-600'}>
                    {syncLoggedIn ? '✅ Connecté' : '❌ Non connecté'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chargement:</span>
                  <span>{isLoading ? '⏳ Oui' : '✅ Non'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ID Visiteur:</span>
                  <span className="truncate max-w-24">{visitorContact?.id || 'Aucun'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="truncate max-w-24">{visitorContact?.email || 'Aucun'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Téléphone:</span>
                  <span className="truncate max-w-24">{visitorContact?.phone || 'Aucun'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Indicateur de statut */}
          <div>
            <h3 className="font-medium mb-3">Indicateur de statut :</h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <QuickVisitorIndicator />
              {!isLoggedIn && (
                <p className="text-gray-500 text-sm">L'indicateur apparaît quand connecté</p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div>
            <h3 className="font-medium mb-3">Actions de test :</h3>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowLogin(true)}
                disabled={isLoggedIn || isLoading}
              >
                Ouvrir connexion rapide
              </Button>
              
              <Button 
                onClick={logout}
                disabled={!isLoggedIn}
                variant="destructive"
              >
                Se déconnecter
              </Button>
              
              <Button 
                onClick={refreshVisitorState}
                variant="outline"
              >
                Forcer rafraîchissement
              </Button>
            </div>
          </div>
          
          {/* Informations techniques */}
          <div>
            <h3 className="font-medium mb-3">Informations techniques :</h3>
            <div className="text-xs space-y-1 font-mono bg-gray-100 p-3 rounded">
              <div>localStorage visitor_contact: {localStorage.getItem('visitor_contact') ? '✅ Présent' : '❌ Absent'}</div>
              <div>localStorage visitor_contact_id: {localStorage.getItem('visitor_contact_id') || 'Aucun'}</div>
              <div>Timestamp: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de connexion */}
      <QuickVisitorLogin
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
} 