import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { RoleGuard } from '@/components/auth';
import { UserRoleInfo, UserPermissions } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield,
  Edit,
  Settings,
  Building2
} from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { profile, user, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-immoo-navy mb-4">
            Profil non trouvé
          </h1>
          <p className="text-immoo-navy/70">
            Veuillez vous connecter pour voir votre profil
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <RoleGuard requiredRole="public">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du profil */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
                  Mon Profil
                </h1>
                <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mt-2">
                  Gérez vos informations personnelles et vos préférences
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale - Informations du profil */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations personnelles */}
              <Card className="border-immoo-gold/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-immoo-navy dark:text-immoo-pearl">
                    <User className="w-5 h-5" />
                    Informations Personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Prénom
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium">
                        {profile.first_name || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Nom
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium">
                        {profile.last_name || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Email
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Téléphone
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {profile.phone || 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                  
                  {profile.address && (
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Adresse
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {profile.address}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations du compte */}
              <Card className="border-immoo-gold/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-immoo-navy dark:text-immoo-pearl">
                    <Shield className="w-5 h-5" />
                    Informations du Compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        ID Utilisateur
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-mono text-sm">
                        {user?.id || 'Non disponible'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Date de création
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {profile.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                          : 'Non disponible'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {profile.agency_id && (
                    <div>
                      <label className="text-sm font-medium text-immoo-navy/70 dark:text-immoo-pearl/70">
                        Agence associée
                      </label>
                      <p className="text-immoo-navy dark:text-immoo-pearl font-medium">
                        ID: {profile.agency_id}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Permissions détaillées */}
              <UserPermissions />
            </div>

            {/* Colonne latérale - Rôle et actions rapides */}
            <div className="space-y-6">
              {/* Informations du rôle */}
              <UserRoleInfo />

              {/* Actions rapides */}
              <Card className="border-immoo-gold/10">
                <CardHeader>
                  <CardTitle className="text-immoo-navy dark:text-immoo-pearl">
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/properties'}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Voir les Propriétés
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/search'}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin'}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Administration
                  </Button>
                </CardContent>
              </Card>

              {/* Statistiques rapides */}
              <Card className="border-immoo-gold/10">
                <CardHeader>
                  <CardTitle className="text-immoo-navy dark:text-immoo-pearl">
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                      Propriétés consultées
                    </span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                      Messages envoyés
                    </span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                      Recherches sauvegardées
                    </span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default UserProfilePage;
