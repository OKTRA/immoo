import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SimpleLogoutTest() {
  const handleLogout = () => {
    console.log('🚨 BOUTON DE DÉCONNEXION CLIQUÉ !');
    alert('Bouton de déconnexion fonctionne !');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">🧪 Test Simple - Bouton Déconnexion</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test du Bouton :</h3>
            <p className="text-blue-700">Cliquez sur le bouton rouge ci-dessous</p>
          </div>

          {/* Bouton de déconnexion de test */}
          <div className="p-2 border-t border-red-500 bg-red-50">
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              DÉCONNEXION (TEST)
            </Button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ Si ça fonctionne :</h3>
            <ul className="text-green-700 space-y-1">
              <li>• Le bouton est visible</li>
              <li>• Le clic fonctionne</li>
              <li>• L'alerte s'affiche</li>
              <li>• Le problème est dans AdminSidebar</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🔍 Prochaines étapes :</h3>
            <ol className="text-yellow-700 space-y-1">
              <li>1. Tester ce composant simple</li>
              <li>2. Si OK, tester AdminSidebarTest</li>
              <li>3. Si OK, vérifier AdminLayout</li>
              <li>4. Contrôler le contexte d'authentification</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
