import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Shield, Building2, User, Crown, Eye } from 'lucide-react';

const UserRoleInfo: React.FC = () => {
  const { profile, getUserRole, hasPermission } = useAuth();

  if (!profile) {
    return null;
  }

  const role = getUserRole();
  
  const roleConfig = {
    admin: {
      label: 'Administrateur',
      icon: Crown,
      color: 'bg-red-500 text-white',
      description: 'Accès complet au système'
    },
    agency: {
      label: 'Agence',
      icon: Building2,
      color: 'bg-blue-500 text-white',
      description: 'Gestion des propriétés et locataires'
    },
    owner: {
      label: 'Propriétaire',
      icon: Shield,
      color: 'bg-green-500 text-white',
      description: 'Gestion de vos biens'
    },
    public: {
      label: 'Visiteur',
      icon: Eye,
      color: 'bg-gray-500 text-white',
      description: 'Consultation des propriétés'
    }
  };

  const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.public;
  const IconComponent = currentRole.icon;

  const permissions = [
    { name: 'Voir les propriétés', check: () => hasPermission('view_properties') },
    { name: 'Créer des propriétés', check: () => hasPermission('create_property') },
    { name: 'Gérer les locataires', check: () => hasPermission('manage_tenants') },
    { name: 'Voir les analytics', check: () => hasPermission('view_analytics') },
    { name: 'Gérer les contrats', check: () => hasPermission('manage_contracts') },
    { name: 'Gérer les paiements', check: () => hasPermission('manage_payments') },
    { name: 'Gérer les utilisateurs', check: () => hasPermission('manage_users') },
    { name: 'Paramètres système', check: () => hasPermission('system_settings') }
  ];

  return (
    <div className="bg-white dark:bg-immoo-navy-light rounded-lg p-6 shadow-sm border border-immoo-gold/10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${currentRole.color}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl">
            {profile.first_name} {profile.last_name}
          </h3>
          <p className="text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
            {profile.email}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Badge className={`${currentRole.color} text-sm font-medium`}>
          {currentRole.label}
        </Badge>
        <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60 mt-2">
          {currentRole.description}
        </p>
      </div>

      <div className="border-t border-immoo-gold/10 pt-4">
        <h4 className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl mb-3">
          Permissions disponibles
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {permissions.map((permission, index) => {
            const hasAccess = permission.check();
            return (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={`text-sm ${hasAccess ? 'text-immoo-navy dark:text-immoo-pearl' : 'text-gray-400'}`}>
                  {permission.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {profile.agency_id && (
        <div className="border-t border-immoo-gold/10 pt-4 mt-4">
          <h4 className="text-sm font-medium text-immoo-navy dark:text-immoo-pearl mb-2">
            Agence associée
          </h4>
          <p className="text-sm text-immoo-navy/60 dark:text-immoo-pearl/60">
            ID: {profile.agency_id}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserRoleInfo;
