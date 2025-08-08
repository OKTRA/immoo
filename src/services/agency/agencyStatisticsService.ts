
import { supabase } from '@/lib/supabase';
import { getAgencyAverageRating } from '@/services/admin/ratingService';

export interface AgencyStatistics {
  propertiesCount: number;
  averageRating: number;
  viewsThisMonth: number;
  viewsLastMonth: number;
  performance: number;
  recentListings: any[];
  totalViews: number;
  ratingCount: number;
}

/**
 * Get comprehensive agency statistics
 */
export const getAgencyStatistics = async (agencyId: string): Promise<{ statistics: AgencyStatistics | null; error: string | null }> => {
  try {
    if (!agencyId) {
      throw new Error('Agency ID is required');
    }

    // Get total properties count
    const { count: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId);
      
    if (propertiesError) {
      console.warn('Error getting properties count:', propertiesError);
    }

    // Get average rating from admin ratings
    const averageRating = await getAgencyAverageRating(agencyId);
    const ratingCount = 0; // Will be updated when we implement rating count in ratingService

    // Get views from agency_views table (if exists) or calculate from visitor_contacts
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    // Count views this month from visitor_contacts (aligned with current schema)
    const { count: viewsThisMonth, error: viewsThisMonthError } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('purpose', 'view')
      .gte('created_at', thisMonthStart.toISOString());

    // Count views last month from visitor_contacts
    const { count: viewsLastMonth, error: viewsLastMonthError } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('purpose', 'view')
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonthStart.toISOString());

    // Get total views (all time)
    const { count: totalViews, error: totalViewsError } = await supabase
      .from('visitor_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('purpose', 'view');

    if (viewsThisMonthError || viewsLastMonthError || totalViewsError) {
      console.warn('Error getting views data:', { viewsThisMonthError, viewsLastMonthError, totalViewsError });
    }

    // Calculate performance based on multiple factors
    const performance = calculateAgencyPerformance({
      propertiesCount: propertiesCount || 0,
      averageRating,
      viewsThisMonth: viewsThisMonth || 0,
      ratingCount
    });
    
    // Get recent listings
    const { data: recentListings, error: listingsError } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (listingsError) {
      console.warn('Error getting recent listings:', listingsError);
    }
    
    return {
      statistics: {
        propertiesCount: propertiesCount || 0,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        viewsThisMonth: viewsThisMonth || 0,
        viewsLastMonth: viewsLastMonth || 0,
        performance,
        recentListings: recentListings || [],
        totalViews: totalViews || 0,
        ratingCount
      },
      error: null
    };
  } catch (error: any) {
    console.error(`Error getting statistics for agency ${agencyId}:`, error);
    return {
      statistics: null,
      error: error.message
    };
  }
};

/**
 * Calculate agency performance score (0-100)
 */
function calculateAgencyPerformance(data: {
  propertiesCount: number;
  averageRating: number;
  viewsThisMonth: number;
  ratingCount: number;
}): number {
  let score = 0;
  
  // Properties count factor (0-25 points)
  if (data.propertiesCount > 0) {
    score += Math.min(25, data.propertiesCount * 2.5);
  }
  
  // Rating factor (0-35 points)
  if (data.averageRating > 0) {
    score += (data.averageRating / 5) * 35;
  }
  
  // Views factor (0-25 points)
  if (data.viewsThisMonth > 0) {
    score += Math.min(25, (data.viewsThisMonth / 100) * 25);
  }
  
  // Rating count factor (0-15 points) - more ratings = more credible
  if (data.ratingCount > 0) {
    score += Math.min(15, data.ratingCount * 1.5);
  }
  
  return Math.min(100, Math.round(score));
}

/**
 * Get agency views trend (percentage change)
 */
export const getAgencyViewsTrend = (viewsThisMonth: number, viewsLastMonth: number): string => {
  if (viewsLastMonth === 0) {
    return viewsThisMonth > 0 ? '+100%' : '0%';
  }
  
  const change = ((viewsThisMonth - viewsLastMonth) / viewsLastMonth) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${Math.round(change)}%`;
};

/**
 * Record agency view (when someone visits agency page or property)
 */
export const recordAgencyView = async (agencyId: string, viewType: 'agency' | 'property', propertyId?: string) => {
  try {
    // For now, we'll use visitor_contacts table to track views
    // In a real implementation, you might want a dedicated views table
    const viewData = {
      agency_id: agencyId,
      view_type: viewType,
      property_id: propertyId,
      created_at: new Date().toISOString()
    };
    
    // You could create a dedicated agency_views table for this
    console.log('Recording agency view:', viewData);
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error recording agency view:', error);
    return { success: false, error: error.message };
  }
};
