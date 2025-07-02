import React from 'react';
import { useAuth, useAuthStatus } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const AuthStatusDemo: React.FC = () => {
  const { 
    user, 
    profile, 
    status, 
    isLoading, 
    initialized, 
    error,
    signOut,
    hasRole,
    isAgency,
    isAdmin 
  } = useAuth();
  
  const { 
    isAuthenticated, 
    isUnauthenticated, 
    isReady, 
    isError 
  } = useAuthStatus();

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="h-4 w-4 animate-spin" />;
    if (isAuthenticated) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isError) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="outline" className="bg-blue-50">🔄 Chargement</Badge>;
    if (isAuthenticated) return <Badge className="bg-green-100 text-green-700">✅ Connecté</Badge>;
    if (isError) return <Badge variant="destructive">❌ Erreur</Badge>;
    return <Badge variant="outline">⭕ Déconnecté</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Statut d'Authentification - Système Bulletproof
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut Principal */}
        <div className="flex items-center justify-between">
          <span className="font-medium">État:</span>
          {getStatusBadge()}
        </div>

        {/* Détails de l'utilisateur */}
        {isAuthenticated && user && profile && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Utilisateur Connecté
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">ID:</span> {user.id.slice(0, 8)}...
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Nom:</span> {profile.first_name} {profile.last_name}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rôle:</span>
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                  {profile.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">Erreur:</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* États Techniques */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">États Techniques:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${initialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
              Initialisé: {initialized ? 'Oui' : 'Non'}
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              Prêt: {isReady ? 'Oui' : 'Non'}
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              Chargement: {isLoading ? 'Oui' : 'Non'}
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${status === 'authenticated' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              Status: {status}
            </div>
          </div>
        </div>

        {/* Fonctions Utilitaires */}
        {isAuthenticated && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Fonctions Utilitaires:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={isAdmin() ? "default" : "outline"}>
                  {isAdmin() ? '✅' : '❌'} Admin
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isAgency() ? "default" : "outline"}>
                  {isAgency() ? '✅' : '❌'} Agence
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={hasRole('visiteur') ? "default" : "outline"}>
                  {hasRole('visiteur') ? '✅' : '❌'} Visiteur
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isAuthenticated && (
          <div className="pt-4 border-t">
            <Button 
              onClick={signOut} 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
            >
              Se déconnecter
            </Button>
          </div>
        )}

        {/* Informations système */}
        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>🛡️ Système d'authentification bulletproof actif</p>
          <p>✅ Gestion des race conditions, synchronisation cross-tab, cache intelligent</p>
        </div>
      </CardContent>
    </Card>
  );
}; 