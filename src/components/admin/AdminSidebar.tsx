import React from 'react';
import { 
  Users, Building2, Home, Settings, LayoutDashboard, 
  Bell, LogOut, Menu, X, Tag, CreditCard, 
  PieChart, BarChart, HelpCircle, CreditCard as PaymentIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Starting admin logout...');
      
      // Clear local storage first
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-hzbogwleoszwtneveuvx-auth-token');
      
      // Try to sign out, but don't fail if the session is already invalid
      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          console.warn('Logout warning:', error);
        }
      } catch (authError: any) {
        console.log('Auth session already invalid, continuing logout...');
      }
      
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error: any) {
      console.error('Error during admin logout:', error);
      // Even if there's an error, still navigate away and show success
      toast.success('Déconnexion réussie');
      navigate('/');
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'agencies', label: 'Agences', icon: Building2 },
    { id: 'properties', label: 'Propriétés', icon: Home },
    { id: 'payments', label: 'Paiements', icon: PaymentIcon },
    { id: 'analytics', label: 'Rapports & Analyses', icon: BarChart },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'promo', label: 'Codes Promo', icon: Tag },
    { id: 'support', label: 'Support Utilisateur', icon: HelpCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle button (mobile only) */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {collapsed ? <Menu /> : <X />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar-background border-r border-border flex flex-col z-40",
          "fixed md:static inset-y-0 left-0 transition-all duration-300",
          collapsed ? "-translate-x-full md:w-20 md:translate-x-0" : "w-64"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className={cn("flex items-center gap-2", collapsed && "md:justify-center")}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            {!collapsed && <h1 className="text-lg font-semibold">Admin Panel</h1>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden md:flex"
            onClick={toggleSidebar}
          >
            {collapsed ? <Menu /> : <X />}
          </Button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start font-normal h-10",
                collapsed && "md:justify-center md:px-0",
                activeTab === item.id && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={cn("h-5 w-5 mr-3", collapsed && "md:mr-0")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start",
              collapsed && "md:justify-center"
            )}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className={cn("h-5 w-5 mr-3", collapsed && "md:mr-0")} />
            {!collapsed && <span>Notifications</span>}
          </Button>

          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
              collapsed && "md:justify-center"
            )}
            onClick={handleSignOut}
          >
            <LogOut className={cn("h-5 w-5 mr-3", collapsed && "md:mr-0")} />
            {!collapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
