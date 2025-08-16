import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthDebugPage: React.FC = () => {
  const { status, user, profile, isLoading, error, initialized } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Authentification</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">État d'authentification</h3>
              <p className="text-sm text-gray-600">Status: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{status}</span></p>
              <p className="text-sm text-gray-600">Loading: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{isLoading ? 'true' : 'false'}</span></p>
              <p className="text-sm text-gray-600">Initialized: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{initialized ? 'true' : 'false'}</span></p>
              {error && (
                <p className="text-sm text-red-600">Error: <span className="font-mono bg-red-100 px-2 py-1 rounded">{error}</span></p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700">Utilisateur</h3>
              {user ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{user.id}</span></p>
                  <p className="text-sm text-gray-600">Email: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.email}</span></p>
                  <p className="text-sm text-gray-600">Created: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{user.created_at}</span></p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Aucun utilisateur connecté</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700">Profil</h3>
            {profile ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{profile.id}</span></p>
                <p className="text-sm text-gray-600">Nom: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{profile.first_name} {profile.last_name}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{profile.email}</span></p>
                <p className="text-sm text-gray-600">Rôle: <span className="font-mono bg-blue-100 px-2 py-1 rounded font-semibold">{profile.role}</span></p>
                <p className="text-sm text-gray-600">Téléphone: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{profile.phone || 'N/A'}</span></p>
                <p className="text-sm text-gray-600">Créé: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{profile.created_at}</span></p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucun profil trouvé</p>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Données brutes</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify({ status, user, profile, isLoading, error, initialized }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;