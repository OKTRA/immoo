
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Home, 
  Heart,
  CreditCard, 
  BarChart3, 
  Package,
  Ticket,
  Settings,
  Crown,
  Wallet,
  PhoneCall,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  to?: string;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
}

export default function AdminSidebar({ activeTab, setActiveTab, userRole }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  let menuItems: MenuItem[] = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'agencies', label: 'Agences', icon: Building },
    { id: 'properties', label: 'Propriétés', icon: Home },
    { id: 'visitor-analytics', label: 'Favoris & Visiteurs', icon: Heart },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'analytics', label: 'Rapports & Analyses', icon: BarChart3 },
    { id: 'subscriptions', label: 'Plans d\'abonnement', icon: Package },
    { id: 'subscription-payments', label: 'Paiements Abonnements', icon: Wallet },
    { id: 'subscription-payment-methods', label: 'Config Paiements', icon: PhoneCall },
    { id: 'promo', label: 'Codes Promo', icon: Crown },
    { id: 'support', label: 'Support', icon: Ticket },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];
  
  if (userRole === 'agency') {
    menuItems.splice(5, 0, {
      id: 'contracts',
      label: 'Contrats',
      icon: FileText,
      to: '/contracts',
    });
  }

  const handleSignOut = async () => {
    try {
      console.log('🔄 Tentative de déconnexion...');
      await signOut();
      console.log('✅ Déconnexion réussie, redirection...');
      navigate('/');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col h-screen`}>
      {/* Header avec bouton collapse/expand */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Administration
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-2 h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return item.to ? (
            <a href={item.to} key={item.id}>
              <Button
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${collapsed ? 'px-2' : 'px-3'}`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`${collapsed ? 'mr-0' : 'mr-2'} h-4 w-4`} />
                {!collapsed && item.label}
              </Button>
            </a>
          ) : (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start ${collapsed ? 'px-2' : 'px-3'}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`${collapsed ? 'mr-0' : 'mr-2'} h-4 w-4`} />
              {!collapsed && item.label}
            </Button>
          );
        })}
      </nav>

      {/* Bouton de déconnexion - FORCÉMENT VISIBLE */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
        <Button
          variant="destructive"
          className={`w-full justify-start ${collapsed ? 'px-2' : 'px-3'} bg-red-600 hover:bg-red-700 text-white`}
          onClick={handleSignOut}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className={`${collapsed ? 'mr-0' : 'mr-2'} h-4 w-4`} />
          {!collapsed && 'Déconnexion'}
        </Button>
      </div>
    </div>
  );
}
