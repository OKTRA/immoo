import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function AgencyRedirectTest() {
  const { profile, user, hasRole, getUserRole } = useAuth();
  const navigate = useNavigate();

  const testAgencyRedirect = () => {
    if (hasRole('agency')) {
      navigate('/agency/dashboard');
    } else {
      alert('Vous devez avoir le rôle "agency" pour tester cette redirection');
    }
  };

  const goToMyAgencies = () => {
    navigate('/my-agencies');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Test de Redirection Agence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Informations de l'utilisateur :</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>ID Utilisateur:</span>
              <span className="font-mono text-xs">{user?.id || 'Non connecté'}</span>
              
              <span>Email:</span>
              <span>{user?.email || 'Non connecté'}</span>
              
              <span>Rôle actuel:</span>
              <Badge variant={profile?.role === 'agency' ? 'default' : 'secondary'}>
                {getUserRole() || 'Non défini'}
              </Badge>
              
              <span>Est une agence:</span>
              <Badge variant={hasRole('agency') ? 'default' : 'destructive'}>
                {hasRole('agency') ? 'Oui' : 'Non'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Tests disponibles :</h3>
            <div className="flex gap-2">
              <Button 
                onClick={testAgencyRedirect}
                disabled={!hasRole('agency')}
                variant="outline"
              >
                Test Redirection /agency/dashboard
              </Button>
              
              <Button 
                onClick={goToMyAgencies}
                variant="default"
              >
                Aller à /my-agencies
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Comment tester :</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>Connectez-vous avec un compte ayant le rôle "agency"</li>
              <li>Cliquez sur "Test Redirection /agency/dashboard"</li>
              <li>Vous devriez être automatiquement redirigé vers /my-agencies</li>
              <li>Vérifiez que l'URL change dans votre navigateur</li>
            </ol>
          </div>

          {!hasRole('agency') && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Attention :</h4>
              <p className="text-sm text-yellow-700">
                Vous n'avez pas le rôle "agency". Pour tester la redirection, 
                connectez-vous avec un compte agence ou créez-en un via le formulaire "Devenir une agence".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
