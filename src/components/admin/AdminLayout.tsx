import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import UsersManagement from './UsersManagement';
import AgenciesManagement from './AgenciesManagement';
import PropertiesManagement from './PropertiesManagement';
import SystemSettings from './SystemSettings';
import AdminDashboardOverview from './AdminDashboardOverview';
import PaymentsManagement from './PaymentsManagement';
import AnalyticsManagement from './analytics/AnalyticsManagement';
import SupportManagement from './SupportManagement';
import SubscriptionPlansManagement from './SubscriptionPlansManagement';
import SubscriptionPaymentsManagement from './SubscriptionPaymentsManagement';
import SubscriptionPaymentMethods from './SubscriptionPaymentMethods';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        if (currentUser) {
          setUser(currentUser);
          
          // Check if user has admin role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          
          if (profileData) {
            setUserRole(profileData.role);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <AdminHeader user={user} />

        <main className="flex-1 p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden">
              <TabsTrigger value="overview">Tableau de bord</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="agencies">Agences</TabsTrigger>
              <TabsTrigger value="properties">Propriétés</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
              <TabsTrigger value="analytics">Rapports & Analyses</TabsTrigger>
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
              <TabsTrigger value="subscription-payments">Paiements Abonnements</TabsTrigger>
              <TabsTrigger value="subscription-payment-methods">Config Paiements</TabsTrigger>
              <TabsTrigger value="promo">Codes Promo</TabsTrigger>
              <TabsTrigger value="support">Support Utilisateur</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminDashboardOverview />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersManagement />
            </TabsContent>

            <TabsContent value="agencies" className="space-y-6">
              <AgenciesManagement />
            </TabsContent>

            <TabsContent value="properties" className="space-y-6">
              <PropertiesManagement />
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <PaymentsManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsManagement />
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <SubscriptionPlansManagement />
            </TabsContent>

            <TabsContent value="subscription-payments" className="space-y-6">
              <SubscriptionPaymentsManagement />
            </TabsContent>

            <TabsContent value="subscription-payment-methods" className="space-y-6">
              <SubscriptionPaymentMethods />
            </TabsContent>

            <TabsContent value="promo" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Gestion des codes promo</h1>
              </div>
              <Tabs defaultValue="active" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="active">Codes actifs</TabsTrigger>
                  <TabsTrigger value="expired">Codes expirés</TabsTrigger>
                  <TabsTrigger value="stats">Statistiques</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  <SystemSettings />
                </TabsContent>
                <TabsContent value="expired">
                  <div className="text-center text-muted-foreground py-6">
                    La gestion des codes expirés sera implémentée prochainement
                  </div>
                </TabsContent>
                <TabsContent value="stats">
                  <div className="text-center text-muted-foreground py-6">
                    Les statistiques des codes promo seront implémentées prochainement
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <SupportManagement />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
