import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Building2, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Shield, 
  Eye,
  Crown,
  Search,
  MessageSquare,
  FileText
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string;
  requiredPermission?: string;
  badge?: string;
  children?: NavigationItem[];
}

const RoleBasedNavigation: React.FC = () => {
  const { profile } = useAuth();
  const { canAccess, hasRole } = usePermissions();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      label: 'Accueil',
      href: '/',
      icon: Home,
      requiredRole: 'public'
    },
    {
      label: 'Propriétés',
      href: '/properties',
      icon: Building2,
      requiredRole: 'public'
    },
    {
      label: 'Recherche',
      href: '/search',
      icon: Search,
      requiredRole: 'public'
    },
    {
      label: 'Gestion des Propriétés',
      href: '/admin/properties',
      icon: Building2,
      requiredPermission: 'create_property',
      children: [
        {
          label: 'Toutes les Propriétés',
          href: '/admin/properties',
          icon: Building2,
          requiredPermission: 'view_properties'
        },
        {
          label: 'Ajouter une Propriété',
          href: '/admin/properties/new',
          icon: Building2,
          requiredPermission: 'create_property'
        },
        {
          label: 'Images des Propriétés',
          href: '/admin/properties/images',
          icon: FileText,
          requiredPermission: 'manage_property_images'
        }
      ]
    },
    {
      label: 'Gestion des Locataires',
      href: '/admin/tenants',
      icon: Users,
      requiredPermission: 'manage_tenants',
      children: [
        {
          label: 'Tous les Locataires',
          href: '/admin/tenants',
          icon: Users,
          requiredPermission: 'view_tenants'
        },
        {
          label: 'Contrats de Location',
          href: '/admin/tenants/contracts',
          icon: FileText,
          requiredPermission: 'create_contracts'
        },
        {
          label: 'Paiements',
          href: '/admin/tenants/payments',
          icon: CreditCard,
          requiredPermission: 'manage_tenant_payments'
        }
      ]
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      requiredPermission: 'view_analytics',
      children: [
        {
          label: 'Vue d\'ensemble',
          href: '/admin/analytics',
          icon: BarChart3,
          requiredPermission: 'view_analytics'
        },
        {
          label: 'Rapports Détaillés',
          href: '/admin/analytics/reports',
          icon: FileText,
          requiredPermission: 'view_detailed_analytics'
        },
        {
          label: 'Statistiques Avancées',
          href: '/admin/analytics/advanced',
          icon: BarChart3,
          requiredPermission: 'view_advanced_stats'
        }
      ]
    },
    {
      label: 'Paiements',
      href: '/admin/payments',
      icon: CreditCard,
      requiredPermission: 'manage_payments',
      children: [
        {
          label: 'Historique des Paiements',
          href: '/admin/payments',
          icon: CreditCard,
          requiredPermission: 'view_payments'
        },
        {
          label: 'Gestion des Paiements',
          href: '/admin/payments/manage',
          icon: CreditCard,
          requiredPermission: 'manage_payments'
        },
        {
          label: 'Factures',
          href: '/admin/payments/invoices',
          icon: FileText,
          requiredPermission: 'create_invoices'
        },
        {
          label: 'Méthodes de Paiement',
          href: '/admin/payments/methods',
          icon: CreditCard,
          requiredPermission: 'manage_payment_methods'
        }
      ]
    },
    {
      label: 'Administration',
      href: '/admin',
      icon: Settings,
      requiredRole: 'admin',
      children: [
        {
          label: 'Tableau de Bord',
          href: '/admin',
          icon: Settings,
          requiredRole: 'admin'
        },
        {
          label: 'Gestion des Utilisateurs',
          href: '/admin/users',
          icon: Users,
          requiredPermission: 'manage_users'
        },
        {
          label: 'Gestion des Agences',
          href: '/admin/agencies',
          icon: Building2,
          requiredPermission: 'manage_agencies'
        },
        {
          label: 'Gestion des Rôles',
          href: '/admin/roles',
          icon: Shield,
          requiredPermission: 'manage_roles'
        },
        {
          label: 'Paramètres Système',
          href: '/admin/settings',
          icon: Settings,
          requiredPermission: 'system_settings'
        }
      ]
    },
    {
      label: 'Messages',
      href: '/admin/messages',
      icon: MessageSquare,
      requiredPermission: 'manage_messages'
    },
    {
      label: 'Mon Profil',
      href: '/profile',
      icon: Shield,
      requiredRole: 'public'
    }
  ];

  const isItemVisible = (item: NavigationItem): boolean => {
    // Vérifier le rôle requis
    if (item.requiredRole && item.requiredRole !== 'public') {
      if (!hasRole(item.requiredRole)) {
        return false;
      }
    }

    // Vérifier la permission requise
    if (item.requiredPermission) {
      if (!canAccess(item.requiredPermission)) {
        return false;
      }
    }

    return true;
  };

  const renderNavigationItem = (item: NavigationItem, isChild: boolean = false) => {
    if (!isItemVisible(item)) {
      return null;
    }

    const isActive = location.pathname === item.href || 
                    (item.children && item.children.some(child => location.pathname === child.href));

    const IconComponent = item.icon;

    return (
      <div key={item.href} className={cn(isChild ? 'ml-4' : '')}>
        <Link
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-immoo-gold text-immoo-navy'
              : 'text-immoo-navy/70 hover:text-immoo-navy hover:bg-immoo-gold/10',
            isChild && 'text-sm'
          )}
        >
          <IconComponent className={cn('w-4 h-4', isChild ? 'w-3 h-3' : '')} />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-immoo-gold text-immoo-navy text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>

        {/* Afficher les enfants si l'élément est actif */}
        {item.children && isActive && (
          <div className="mt-2 space-y-1">
            {item.children.map(child => renderNavigationItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  const visibleItems = navigationItems.filter(isItemVisible);

  if (!profile) {
    return null;
  }

  return (
    <nav className="space-y-2">
      {visibleItems.map(item => renderNavigationItem(item))}
    </nav>
  );
};

export default RoleBasedNavigation;
