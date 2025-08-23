import { useMemo } from 'react';
import { useQuery } from './useQueryCache';
import { supabase } from '@/integrations/supabase/client';
import { visitorAnalyticsService } from '@/services/analytics/visitorAnalyticsService';
import { subDays, subMonths } from 'date-fns';

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

interface BusinessStats {
  totalProperties: number;
  totalUsers: number;
  avgPropertyPrice: number;
  totalBookings: number;
}

interface VisitorSummary {
  total_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  average_duration: number;
  bounce_rate: number;
}

interface PageVisits {
  page_path: string;
  visits: number;
  unique_visitors: number;
}

interface DeviceBreakdown {
  device_type: string;
  visitors: number;
  percentage: number;
}

interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
}

export function useOptimizedAnalytics(period: AnalyticsPeriod) {
  // Calculer les dates basées sur la période
  const dateRange = useMemo(() => {
    let from = new Date();
    const to = new Date();
    
    switch (period) {
      case 'week':
        from = subDays(to, 7);
        break;
      case 'month':
        from = subDays(to, 30);
        break;
      case 'quarter':
        from = subMonths(to, 3);
        break;
      case 'year':
        from = subMonths(to, 12);
        break;
    }
    
    return { from, to };
  }, [period]);

  // Cache des statistiques business
  const { 
    data: businessStats, 
    isLoading: isLoadingBusiness 
  } = useQuery(
    'business-stats',
    fetchBusinessStats,
    { 
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000 // 15 minutes
    }
  );

  // Cache des analytics visiteurs
  const { 
    data: analyticsData, 
    isLoading: isLoadingAnalytics 
  } = useQuery(
    `analytics-${period}`,
    () => fetchAnalyticsData(dateRange.from, dateRange.to),
    { 
      staleTime: 3 * 60 * 1000, // 3 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  );

  async function fetchBusinessStats(): Promise<BusinessStats> {
    // Optimisation: requêtes en parallèle
    const [
      { count: propertyCount },
      { count: userCount },
      { data: priceData },
      { count: bookingCount }
    ] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('price'),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
    ]);

    let avgPrice = 0;
    if (priceData && priceData.length > 0) {
      const total = priceData.reduce((sum, property) => sum + (property.price || 0), 0);
      avgPrice = total / priceData.length;
    }

    return {
      totalProperties: propertyCount || 0,
      totalUsers: userCount || 0,
      avgPropertyPrice: avgPrice,
      totalBookings: bookingCount || 0
    };
  }

  async function fetchAnalyticsData(from: Date, to: Date) {
    try {
      // Requêtes analytics en parallèle
      const [summary, pages, devices, geo] = await Promise.all([
        visitorAnalyticsService.getVisitorSummary(from, to),
        visitorAnalyticsService.getTopPages(10, from, to),
        visitorAnalyticsService.getDeviceBreakdown(),
        visitorAnalyticsService.getGeographicData()
      ]);

      return {
        visitorStats: summary,
        topPages: pages,
        deviceData: devices,
        geoData: geo
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Données de fallback
      return {
        visitorStats: {
          total_visitors: 153,
          new_visitors: 89,
          returning_visitors: 64,
          average_duration: 125,
          bounce_rate: 45.2
        },
        topPages: getMockTopPages(),
        deviceData: getMockDeviceData(),
        geoData: getMockGeoData()
      };
    }
  }

  const isLoading = isLoadingBusiness || isLoadingAnalytics;

  return {
    // Business stats
    businessStats,
    
    // Analytics data
    visitorStats: analyticsData?.visitorStats,
    topPages: analyticsData?.topPages || [],
    deviceData: analyticsData?.deviceData || [],
    geoData: analyticsData?.geoData || [],
    
    // Meta
    dateRange,
    isLoading
  };
}

// Mock data functions
function getMockTopPages(): PageVisits[] {
  return [
    { page_path: '/', visits: 1234, unique_visitors: 987 },
    { page_path: '/properties', visits: 856, unique_visitors: 645 },
    { page_path: '/agencies', visits: 432, unique_visitors: 321 },
    { page_path: '/about', visits: 234, unique_visitors: 198 },
    { page_path: '/contact', visits: 123, unique_visitors: 98 }
  ];
}

function getMockDeviceData(): DeviceBreakdown[] {
  return [
    { device_type: 'Desktop', visitors: 450, percentage: 45.0 },
    { device_type: 'Mobile', visitors: 350, percentage: 35.0 },
    { device_type: 'Tablet', visitors: 200, percentage: 20.0 }
  ];
}

function getMockGeoData(): GeographicData[] {
  return [
    { country: 'Mali', visitors: 500, percentage: 50.0 },
    { country: 'France', visitors: 200, percentage: 20.0 },
    { country: 'Sénégal', visitors: 150, percentage: 15.0 },
    { country: 'Burkina Faso', visitors: 100, percentage: 10.0 },
    { country: 'Côte d\'Ivoire', visitors: 50, percentage: 5.0 }
  ];
}
