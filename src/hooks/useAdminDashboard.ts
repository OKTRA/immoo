
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupportTicketService } from '@/services/admin/supportTicketService';
import { useQuery } from './useQueryCache';

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
  // Utiliser le système de cache pour les statistiques principales
  const { 
    data: dashboardData, 
    isLoading, 
    refetch 
  } = useQuery(
    'admin-dashboard-stats',
    fetchDashboardData,
    { 
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  );

  const stats = dashboardData?.stats || null;
  const recentActivities = dashboardData?.recentActivities || [];
  const pendingItems = dashboardData?.pendingItems || [];

  async function fetchDashboardData() {
    try {
      // Optimisation: Faire toutes les requêtes en parallèle
      const [
        { count: userCount, error: userError },
        { count: agencyCount, error: agencyError },
        { count: propertyCount, error: propertyError },
        { data: totalProperties, error: totalPropError },
        { data: rentedProperties, error: rentedPropError },
        { count: unverifiedAgencies },
        { count: pendingProperties }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('agencies').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('id'),
        supabase.from('properties').select('id').eq('status', 'rented'),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('verified', false),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);
      
      // Vérifier les erreurs
      if (userError || agencyError || propertyError || totalPropError || rentedPropError) {
        throw userError || agencyError || propertyError || totalPropError || rentedPropError;
      }

      const occupancyRate = totalProperties?.length ? 
        Math.round((rentedProperties?.length || 0) / totalProperties.length * 100) : 0;

      // Fetch recent activities en parallèle avec les tickets de support
      let activities: any[] = [];
      let userProfiles: any[] = [];
      let openTickets = 0;
      
      const [activitiesResult, ticketsResult] = await Promise.allSettled([
        supabase
          .from('user_activities')
          .select('id, activity_type, description, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5),
        SupportTicketService.getOpenTicketsCount()
      ]);

      if (activitiesResult.status === 'fulfilled' && !activitiesResult.value.error) {
        activities = activitiesResult.value.data || [];
        
        // Fetch user names si on a des activités
        if (activities.length > 0) {
          const userIds = activities.map(a => a.user_id).filter(Boolean);
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .in('id', userIds);
            userProfiles = profiles || [];
          }
        }
      }

      if (ticketsResult.status === 'fulfilled') {
        openTickets = ticketsResult.value;
      }

      // Transform activities with user names
      const transformedActivities: RecentActivity[] = activities.map(activity => {
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
      });

      const pendingItemsData: PendingItem[] = [
        {
          type: 'verification' as const,
          count: unverifiedAgencies || 0,
          description: 'demandes de vérification d\'agence',
          daysWaiting: 2
        },
        {
          type: 'report' as const,
          count: openTickets,
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

      // Retourner toutes les données ensemble pour le cache
      return {
        stats: {
          totalUsers: userCount || 0,
          totalAgencies: agencyCount || 0,
          totalProperties: propertyCount || 0,
          occupancyRate,
          usersTrend: '+12.5%',
          agenciesTrend: '+4.3%',
          propertiesTrend: '+7.8%',
          occupancyTrend: occupancyRate > 90 ? '+2.1%' : '-1.2%'
        },
        recentActivities: transformedActivities,
        pendingItems: pendingItemsData
      };

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données du dashboard');
      throw error;
    }
  }

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
    refreshData: refetch
  };
}
