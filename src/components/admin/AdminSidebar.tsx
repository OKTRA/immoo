
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Home, 
  CreditCard, 
  BarChart3, 
  Package,
  Ticket,
  Settings,
  Crown,
  Wallet,
  PhoneCall,
  FileText
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
  let menuItems: MenuItem[] = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'agencies', label: 'Agences', icon: Building },
    { id: 'properties', label: 'Propriétés', icon: Home },
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

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Administration
        </h2>
      </div>
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return item.to ? (
            <a href={item.to} key={item.id}>
              <Button
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </a>
          ) : (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
