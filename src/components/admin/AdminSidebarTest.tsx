import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminSidebarTest() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userRole="admin"
      />
      
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">🧪 Test de la Sidebar d'Administration</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Onglet actif :</h3>
            <p className="text-blue-700 font-mono">{activeTab}</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Fonctionnalités à tester :</h3>
              <ul className="text-green-700 space-y-1">
                <li>• Bouton de flèche pour collapser/expandre la sidebar</li>
                <li>• Navigation entre les onglets du menu</li>
                <li>• <strong>Bouton de déconnexion rouge en bas de la sidebar</strong></li>
                <li>• Tooltips en mode collapsed</li>
                <li>• Transitions fluides</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">🎯 Test du bouton de déconnexion :</h3>
              <ol className="text-yellow-700 space-y-1">
                <li>1. Regarder en bas de la sidebar gauche</li>
                <li>2. Chercher le bouton rouge "Déconnexion"</li>
                <li>3. Cliquer dessus pour tester la fonctionnalité</li>
                <li>4. Vérifier la redirection vers l'accueil</li>
              </ol>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">🚨 Si le bouton n'apparaît pas :</h3>
              <ul className="text-red-700 space-y-1">
                <li>• Vérifier la console du navigateur pour les erreurs</li>
                <li>• S'assurer que l'utilisateur est authentifié</li>
                <li>• Vérifier que le composant AdminSidebar est bien rendu</li>
                <li>• Contrôler que useAuth fonctionne correctement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
