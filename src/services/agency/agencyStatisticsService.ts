
import { supabase } from '@/lib/supabase';

/**
 * Get agency statistics
 */
export const getAgencyStatistics = async (agencyId: string) => {
  try {
    if (!agencyId) {
      throw new Error('Agency ID is required');
    }

    // Get total properties count with fallback
    const { count: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId);
      
    if (propertiesError) {
      console.warn('Error getting properties count:', propertiesError);
      // Continue with fallback data instead of throwing
    }
    
    // Get average property rating with fallback
    const { data: propertyRatings, error: ratingsError } = await supabase
      .from('properties')
      .select('rating')
      .eq('agency_id', agencyId);
      
    if (ratingsError) {
      console.warn('Error getting property ratings:', ratingsError);
    }
    
    const avgRating = propertyRatings && propertyRatings.length > 0
      ? propertyRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / propertyRatings.length
      : 0;
    
    // Get recent listings with fallback
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
        avgRating: avgRating || 0,
        recentListings: recentListings || []
      },
      error: null
    };
  } catch (error: any) {
    console.error(`Error getting statistics for agency ${agencyId}:`, error);
    return {
      statistics: {
        propertiesCount: 0,
        avgRating: 0,
        recentListings: []
      },
      error: error.message
    };
  }
};
