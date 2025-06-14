
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalAgencies: number;
  totalProperties: number;
  occupancyRate: number;
  usersTrend: string;
  agenciesTrend: string;
  propertiesTrend: string;
  occupancyTrend: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  status: 'success' | 'pending' | 'error';
}

interface PendingItem {
  type: 'verification' | 'report' | 'moderation';
  count: number;
  description: string;
  daysWaiting: number;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;

      // Fetch agency count
      const { count: agencyCount, error: agencyError } = await supabase
        .from('agencies')
        .select('*', { count: 'exact', head: true });
      
      if (agencyError) throw agencyError;

      // Fetch property count
      const { count: propertyCount, error: propertyError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      if (propertyError) throw propertyError;

      // Calculate occupancy rate
      const { data: totalProperties, error: totalPropError } = await supabase
        .from('properties')
        .select('id');
      
      const { data: rentedProperties, error: rentedPropError } = await supabase
        .from('properties')
        .select('id')
        .eq('status', 'rented');
      
      if (totalPropError || rentedPropError) throw totalPropError || rentedPropError;

      const occupancyRate = totalProperties?.length ? 
        Math.round((rentedProperties?.length || 0) / totalProperties.length * 100) : 0;

      // Fetch recent activities - simplified query without join to profiles
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('id, activity_type, description, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;

      // Fetch user names separately for activities
      const userIds = activities?.map(a => a.user_id).filter(Boolean) || [];
      let userProfiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        
        if (!profilesError) {
          userProfiles = profiles || [];
        }
      }

      // Transform activities with user names
      const transformedActivities: RecentActivity[] = activities?.map(activity => {
        const userProfile = userProfiles.find(p => p.id === activity.user_id);
        const userName = userProfile ? 
          `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email || 'Utilisateur'
          : 'Utilisateur';

        return {
          id: activity.id,
          user: userName,
          action: activity.description || activity.activity_type,
          time: getRelativeTime(new Date(activity.created_at)),
          status: getActivityStatus(activity.activity_type)
        };
      }) || [];

      // Fetch pending verifications
      const { count: unverifiedAgencies } = await supabase
        .from('agencies')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

      // Fetch open support tickets
      const { count: openTickets } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Fetch properties pending moderation
      const { count: pendingProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const pendingItemsData: PendingItem[] = [
        {
          type: 'verification' as const,
          count: unverifiedAgencies || 0,
          description: 'demandes de vérification d\'agence',
          daysWaiting: 2
        },
        {
          type: 'report' as const,
          count: openTickets || 0,
          description: 'signalements d\'utilisateurs',
          daysWaiting: 1
        },
        {
          type: 'moderation' as const,
          count: pendingProperties || 0,
          description: 'propriétés en attente de modération',
          daysWaiting: 0
        }
      ].filter(item => item.count > 0);

      setStats({
        totalUsers: userCount || 0,
        totalAgencies: agencyCount || 0,
        totalProperties: propertyCount || 0,
        occupancyRate,
        usersTrend: '+12.5%',
        agenciesTrend: '+4.3%',
        propertiesTrend: '+7.8%',
        occupancyTrend: occupancyRate > 90 ? '+2.1%' : '-1.2%'
      });
      
      setRecentActivities(transformedActivities);
      setPendingItems(pendingItemsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données du dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const getActivityStatus = (activityType: string): 'success' | 'pending' | 'error' => {
    switch (activityType) {
      case 'user_registration':
      case 'property_created':
      case 'agency_verified':
        return 'success';
      case 'agency_verification_request':
      case 'property_pending_review':
        return 'pending';
      case 'user_report':
      case 'payment_failed':
        return 'error';
      default:
        return 'success';
    }
  };

  return {
    stats,
    recentActivities,
    pendingItems,
    isLoading,
    refreshData: fetchDashboardData
  };
}
