import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';

export interface Permission {
  name: string;
  key: string;
  description: string;
  category: string;
}

export interface RolePermissions {
  [key: string]: string[];
}

export const usePermissions = () => {
  const { profile, hasRole, hasPermission } = useAuth();

  // Définition complète des permissions par catégorie
  const allPermissions: Permission[] = [
    // Propriétés
    { name: 'Voir les propriétés', key: 'view_properties', description: 'Consulter la liste des propriétés', category: 'Propriétés' },
    { name: 'Créer des propriétés', key: 'create_property', description: 'Ajouter de nouvelles propriétés', category: 'Propriétés' },
    { name: 'Modifier des propriétés', key: 'edit_property', description: 'Modifier les propriétés existantes', category: 'Propriétés' },
    { name: 'Supprimer des propriétés', key: 'delete_property', description: 'Supprimer des propriétés', category: 'Propriétés' },
    { name: 'Gérer les images', key: 'manage_property_images', description: 'Ajouter/supprimer des images de propriétés', category: 'Propriétés' },
    
    // Locataires
    { name: 'Voir les locataires', key: 'view_tenants', description: 'Consulter la liste des locataires', category: 'Locataires' },
    { name: 'Gérer les locataires', key: 'manage_tenants', description: 'Créer/modifier/supprimer des locataires', category: 'Locataires' },
    { name: 'Créer des contrats', key: 'create_contracts', description: 'Créer de nouveaux contrats de location', category: 'Locataires' },
    { name: 'Gérer les contrats', key: 'manage_contracts', description: 'Modifier/renouveler des contrats', category: 'Locataires' },
    { name: 'Gérer les paiements', key: 'manage_tenant_payments', description: 'Suivre les paiements des locataires', category: 'Locataires' },
    
    // Analytics
    { name: 'Voir les analytics', key: 'view_analytics', description: 'Consulter les statistiques de base', category: 'Analytics' },
    { name: 'Voir les analytics détaillés', key: 'view_detailed_analytics', description: 'Accéder aux rapports détaillés', category: 'Analytics' },
    { name: 'Exporter les rapports', key: 'export_reports', description: 'Télécharger les rapports en PDF/Excel', category: 'Analytics' },
    { name: 'Voir les statistiques avancées', key: 'view_advanced_stats', description: 'Accéder aux métriques avancées', category: 'Analytics' },
    
    // Paiements
    { name: 'Voir les paiements', key: 'view_payments', description: 'Consulter l\'historique des paiements', category: 'Paiements' },
    { name: 'Gérer les paiements', key: 'manage_payments', description: 'Traiter et gérer les paiements', category: 'Paiements' },
    { name: 'Créer des factures', key: 'create_invoices', description: 'Générer des factures', category: 'Paiements' },
    { name: 'Gérer les méthodes de paiement', key: 'manage_payment_methods', description: 'Configurer les moyens de paiement', category: 'Paiements' },
    
    // Administration
    { name: 'Gérer les utilisateurs', key: 'manage_users', description: 'Créer/modifier/supprimer des utilisateurs', category: 'Administration' },
    { name: 'Gérer les agences', key: 'manage_agencies', description: 'Gérer les agences immobilières', category: 'Administration' },
    { name: 'Paramètres système', key: 'system_settings', description: 'Configurer les paramètres du système', category: 'Administration' },
    { name: 'Voir toutes les données', key: 'view_all_data', description: 'Accéder à toutes les données de la plateforme', category: 'Administration' },
    { name: 'Gérer les rôles', key: 'manage_roles', description: 'Attribuer et modifier les rôles', category: 'Administration' },
    
    // Communication
    { name: 'Contacter les agences', key: 'contact_agency', description: 'Envoyer des messages aux agences', category: 'Communication' },
    { name: 'Gérer les messages', key: 'manage_messages', description: 'Gérer la boîte de réception', category: 'Communication' },
    { name: 'Notifications système', key: 'system_notifications', description: 'Recevoir les notifications système', category: 'Communication' },
    
    // Recherche
    { name: 'Rechercher des propriétés', key: 'search_properties', description: 'Utiliser les filtres de recherche', category: 'Recherche' },
    { name: 'Recherche avancée', key: 'advanced_search', description: 'Utiliser les critères de recherche avancés', category: 'Recherche' },
    { name: 'Sauvegarder les recherches', key: 'save_searches', description: 'Enregistrer les critères de recherche', category: 'Recherche' }
  ];

  // Permissions par rôle
  const rolePermissions: RolePermissions = {
    public: [
      'view_properties',
      'contact_agency',
      'search_properties',
      'system_notifications'
    ],
    owner: [
      'view_properties',
      'view_own_properties',
      'view_own_analytics',
      'contact_agency',
      'search_properties',
      'manage_own_properties',
      'system_notifications',
      'save_searches'
    ],
    agency: [
      'view_properties',
      'create_property',
      'edit_property',
      'delete_property',
      'manage_property_images',
      'view_tenants',
      'manage_tenants',
      'create_contracts',
      'manage_contracts',
      'manage_tenant_payments',
      'view_analytics',
      'view_detailed_analytics',
      'export_reports',
      'view_payments',
      'manage_payments',
      'create_invoices',
      'manage_payment_methods',
      'contact_agency',
      'manage_messages',
      'search_properties',
      'advanced_search',
      'save_searches',
      'system_notifications'
    ],
    admin: [
      'view_properties',
      'create_property',
      'edit_property',
      'delete_property',
      'manage_property_images',
      'view_tenants',
      'manage_tenants',
      'create_contracts',
      'manage_contracts',
      'manage_tenant_payments',
      'view_analytics',
      'view_detailed_analytics',
      'view_advanced_stats',
      'export_reports',
      'view_payments',
      'manage_payments',
      'create_invoices',
      'manage_payment_methods',
      'manage_users',
      'manage_agencies',
      'system_settings',
      'view_all_data',
      'manage_roles',
      'contact_agency',
      'manage_messages',
      'search_properties',
      'advanced_search',
      'save_searches',
      'system_notifications'
    ]
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const checkPermission = useCallback((permissionKey: string): boolean => {
    if (!profile?.role) return false;
    return rolePermissions[profile.role]?.includes(permissionKey) || false;
  }, [profile?.role]);

  // Vérifier si l'utilisateur a plusieurs permissions
  const checkMultiplePermissions = useCallback((permissionKeys: string[]): boolean => {
    return permissionKeys.every(key => checkPermission(key));
  }, [checkPermission]);

  // Vérifier si l'utilisateur a au moins une des permissions
  const checkAnyPermission = useCallback((permissionKeys: string[]): boolean => {
    return permissionKeys.some(key => checkPermission(key));
  }, [checkPermission]);

  // Obtenir toutes les permissions de l'utilisateur
  const getUserPermissions = useCallback((): Permission[] => {
    if (!profile?.role) return [];
    
    const userPermissionKeys = rolePermissions[profile.role] || [];
    return allPermissions.filter(permission => 
      userPermissionKeys.includes(permission.key)
    );
  }, [profile?.role]);

  // Obtenir les permissions par catégorie
  const getPermissionsByCategory = useCallback(() => {
    const userPermissions = getUserPermissions();
    const grouped: { [category: string]: Permission[] } = {};
    
    userPermissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    
    return grouped;
  }, [getUserPermissions]);

  // Vérifier si l'utilisateur peut accéder à une fonctionnalité
  const canAccess = useCallback((feature: string): boolean => {
    const featurePermissions: { [key: string]: string[] } = {
      'property-management': ['create_property', 'edit_property', 'delete_property'],
      'tenant-management': ['manage_tenants', 'create_contracts'],
      'analytics': ['view_analytics', 'view_detailed_analytics'],
      'payments': ['manage_payments', 'create_invoices'],
      'admin-panel': ['manage_users', 'manage_agencies'],
      'property-viewing': ['view_properties'],
      'search': ['search_properties', 'advanced_search']
    };
    
    const requiredPermissions = featurePermissions[feature] || [];
    return checkMultiplePermissions(requiredPermissions);
  }, [checkMultiplePermissions]);

  return {
    // Vérifications de base
    hasRole,
    hasPermission: checkPermission,
    
    // Vérifications avancées
    checkMultiplePermissions,
    checkAnyPermission,
    canAccess,
    
    // Informations sur les permissions
    getUserPermissions,
    getPermissionsByCategory,
    allPermissions,
    rolePermissions,
    
    // État de l'utilisateur
    userRole: profile?.role || 'public',
    isAuthenticated: !!profile,
    
    // Utilitaires
    getPermissionDescription: (key: string) => 
      allPermissions.find(p => p.key === key)?.description || '',
    
    getPermissionCategory: (key: string) => 
      allPermissions.find(p => p.key === key)?.category || ''
  };
};
