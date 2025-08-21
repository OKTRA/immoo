import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield, Building2, Crown, Eye } from 'lucide-react';

const UserPermissions: React.FC = () => {
  const { profile, getUserRole, hasPermission } = useAuth();

  if (!profile) {
    return null;
  }

  const role = getUserRole();
  
  const roleConfig = {
    admin: {
      label: 'Administrateur',
      icon: Crown,
      color: 'bg-red-500',
      description: 'Accès complet au système avec toutes les permissions'
    },
    agency: {
      label: 'Agence',
      icon: Building2,
      color: 'bg-blue-500',
      description: 'Gestion des propriétés, locataires et contrats'
    },
    owner: {
      label: 'Propriétaire',
      icon: Shield,
      color: 'bg-green-500',
      description: 'Gestion de vos propres biens et analytics'
    },
    public: {
      label: 'Visiteur',
      icon: Eye,
      color: 'bg-gray-500',
      description: 'Consultation des propriétés et contact des agences'
    }
  };

  const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.public;
  const IconComponent = currentRole.icon;

  const allPermissions = [
    {
      category: 'Propriétés',
      permissions: [
        { name: 'Voir les propriétés', key: 'view_properties' },
        { name: 'Créer des propriétés', key: 'create_property' },
        { name: 'Modifier des propriétés', key: 'edit_property' },
        { name: 'Supprimer des propriétés', key: 'delete_property' }
      ]
    },
    {
      category: 'Locataires',
      permissions: [
        { name: 'Voir les locataires', key: 'view_tenants' },
        { name: 'Gérer les locataires', key: 'manage_tenants' },
        { name: 'Créer des contrats', key: 'create_contracts' },
        { name: 'Gérer les contrats', key: 'manage_contracts' }
      ]
    },
    {
      category: 'Analytics',
      permissions: [
        { name: 'Voir les analytics', key: 'view_analytics' },
        { name: 'Voir les analytics détaillés', key: 'view_detailed_analytics' },
        { name: 'Exporter les rapports', key: 'export_reports' }
      ]
    },
    {
      category: 'Paiements',
      permissions: [
        { name: 'Voir les paiements', key: 'view_payments' },
        { name: 'Gérer les paiements', key: 'manage_payments' },
        { name: 'Créer des factures', key: 'create_invoices' }
      ]
    },
    {
      category: 'Administration',
      permissions: [
        { name: 'Gérer les utilisateurs', key: 'manage_users' },
        { name: 'Gérer les agences', key: 'manage_agencies' },
        { name: 'Paramètres système', key: 'system_settings' },
        { name: 'Voir toutes les données', key: 'view_all_data' }
      ]
    }
  ];

  return (
    <Card className="border-immoo-gold/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${currentRole.color} text-white`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl text-immoo-navy dark:text-immoo-pearl">
              Vos Permissions
            </CardTitle>
            <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
              {currentRole.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {allPermissions.map((category) => (
            <div key={category.category}>
              <h4 className="font-semibold text-immoo-navy dark:text-immoo-pearl mb-3">
                {category.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.permissions.map((permission) => {
                  const hasAccess = hasPermission(permission.key);
                  return (
                    <div
                      key={permission.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        hasAccess
                          ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
                      }`}
                    >
                      {hasAccess ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span
                        className={`text-sm ${
                          hasAccess
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {permission.name}
                      </span>
                      {hasAccess && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Actif
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-immoo-gold/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                <strong>Rôle actuel:</strong> {currentRole.label}
              </p>
              <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
                <strong>Permissions actives:</strong> {
                  allPermissions.flatMap(cat => cat.permissions).filter(p => hasPermission(p.key)).length
                } / {allPermissions.flatMap(cat => cat.permissions).length}
              </p>
            </div>
            <Badge className={`${currentRole.color} text-white`}>
              {currentRole.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissions;
