import React, { useState } from 'react';
import AgencyProfileIcon, { AgencyProfileIconCompact } from '@/components/ui/AgencyProfileIcon';

export default function AgencyProfileIconTest() {
  const [showBadges, setShowBadges] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎨 Test de l'Icône de Profil Agence
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-4">
              Nouvelle icône de profil agence plus visible et professionnelle
            </p>
            <div className="flex items-center justify-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showBadges}
                  onChange={(e) => setShowBadges(e.target.checked)}
                  className="rounded"
                />
                <span>Afficher les badges</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded"
                />
                <span>Statut Premium</span>
              </label>
            </div>
          </div>

          {/* Icônes de taille normale */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Icônes de Profil Agence - Taille Normale
            </h2>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Petite</h3>
                <AgencyProfileIcon 
                  size="sm" 
                  showBadge={showBadges}
                  isPremium={isPremium}
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Moyenne</h3>
                <AgencyProfileIcon 
                  size="md" 
                  showBadge={showBadges}
                  isPremium={isPremium}
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Grande</h3>
                <AgencyProfileIcon 
                  size="lg" 
                  showBadge={showBadges}
                  isPremium={isPremium}
                />
              </div>
            </div>
          </div>

          {/* Icônes compactes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Icônes Compactes pour Boutons
            </h2>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Petite</h3>
                <AgencyProfileIconCompact 
                  size="sm" 
                  showBadge={showBadges}
                  isPremium={isPremium}
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Moyenne</h3>
                <AgencyProfileIconCompact 
                  size="md" 
                  showBadge={showBadges}
                  isPremium={isPremium}
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Grande</h3>
                <AgencyProfileIconCompact 
                  size="lg" 
                  showBadge={showBadges}
                  isPremium={isPremium}
                />
              </div>
            </div>
          </div>

          {/* Démonstration des fonctionnalités */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              ✨ Fonctionnalités de l'Icône
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-700">🎨 Design Visuel</h3>
                <ul className="text-blue-600 space-y-1 text-sm">
                  <li>• Gradient bleu professionnel</li>
                  <li>• Icône Building2 pour représenter l'agence</li>
                  <li>• Ombres et bordures élégantes</li>
                  <li>• Effets de brillance au survol</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-700">🔧 Fonctionnalités</h3>
                <ul className="text-blue-600 space-y-1 text-sm">
                  <li>• Badge de statut agence (Shield)</li>
                  <li>• Badge premium avec couronne</li>
                  <li>• Indicateur de connexion vert</li>
                  <li>• Tooltip informatif au survol</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions d'utilisation */}
          <div className="bg-green-50 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4 text-center">
              📍 Utilisation dans le Header
            </h2>
            <div className="text-green-700 text-center space-y-2">
              <p><strong>Desktop :</strong> Icône compacte dans NavbarDesktopMenu</p>
              <p><strong>Mobile :</strong> Icône compacte dans MobileActionButtons</p>
              <p><strong>Navigation :</strong> Clic → Redirection vers /my-agencies</p>
              <p><strong>Rôle :</strong> Visible uniquement pour les utilisateurs agence connectés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
