import { supabase } from '@/lib/supabase';

export interface SubscriptionLimit {
  resourceType?: string;
  currentCount: number;
  maxAllowed: number;
  planName?: string;
  allowed: boolean;
  percentageUsed?: number;
  planId?: string;
  isUnlimited?: boolean;
  error?: string;
}

/**
 * Vérifier les limites d'une ressource pour l'utilisateur
 */
export const checkUserResourceLimit = async (
  userId: string,
  resourceType: 'properties' | 'agencies' | 'leases' | 'users',
  agencyId?: string
): Promise<SubscriptionLimit> => {
  try {
    // First, try to get the user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      // No active subscription found, treat as free plan
      const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
      return getFreePlanLimits(currentCount, resourceType);
    }

    if (!subscription.subscription_plans) {
      // No plan found, treat as free plan
      const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
      return getFreePlanLimits(currentCount, resourceType);
    }

    // Get current count of resources
    const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
    
    // Get the appropriate limit from the plan
    const plan = subscription.subscription_plans;
    const limits = {
      properties: plan.max_properties || 1,
      agencies: plan.max_agencies || 1,
      leases: plan.max_leases || 2,
      users: plan.max_users || 1
    };

    const maxAllowed = limits[resourceType];
    
    // Si la limite est -1, c'est illimité
    const isUnlimited = maxAllowed === -1;
    const allowed = isUnlimited || currentCount < maxAllowed;
    const percentageUsed = isUnlimited ? 0 : Math.round((currentCount / maxAllowed) * 100);

    const result = {
      resourceType,
      currentCount,
      maxAllowed: isUnlimited ? -1 : maxAllowed,
      planName: plan.name,
      allowed,
      percentageUsed,
      planId: plan.id,
      isUnlimited
    };

    return result;
  } catch (error: any) {
    console.error('Error checking user resource limit:', error);
    return {
      allowed: false,
      currentCount: 0,
      maxAllowed: 0,
      error: error.message,
      percentageUsed: 100
    };
  }
};

/**
 * Get current count of resources for a user - CORRECTED VERSION
 */
export const getCurrentResourceCount = async (
  userId: string,
  resourceType: 'properties' | 'agencies' | 'leases' | 'users',
  agencyId?: string
): Promise<number> => {
  try {
    let count = 0;
    
    switch (resourceType) {
      case 'agencies':
        const { count: agencyCount } = await supabase
          .from('agencies')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        count = agencyCount || 0;
        break;
        
      case 'properties':
        if (agencyId) {
          // Count properties for specific agency
          const { count: propCount } = await supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('agency_id', agencyId);
          count = propCount || 0;
        } else {
          // Count properties from all user's agencies - FIXED LOGIC
          const { count: propCount } = await supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .in('agency_id', 
              supabase
                .from('agencies')
                .select('id')
                .eq('user_id', userId)
            );
          count = propCount || 0;
        }
        break;
        
      case 'leases':
        if (agencyId) {
          // Count leases for properties in specific agency
          const { count: leaseCount } = await supabase
            .from('leases')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
            .in('property_id',
              supabase
                .from('properties')
                .select('id')
                .eq('agency_id', agencyId)
            );
          count = leaseCount || 0;
        } else {
          // Count leases for all user's properties - FIXED LOGIC
          const { count: leaseCount } = await supabase
            .from('leases')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
            .in('property_id',
              supabase
                .from('properties')
                .select('id')
                .in('agency_id',
                  supabase
                    .from('agencies')
                    .select('id')
                    .eq('user_id', userId)
                )
            );
          count = leaseCount || 0;
        }
        break;
        
      case 'users':
        // For now, just count the user themselves
        count = 1;
        break;
        
      default:
        count = 0;
    }
    
    return count;
  } catch (error: any) {
    console.error(`Error getting ${resourceType} count for user ${userId}:`, error);
    return 0;
  }
};

/**
 * CORRECTED free plan limits function
 */
const getFreePlanLimits = (currentCount: number, resourceType: 'properties' | 'agencies' | 'leases' | 'users'): SubscriptionLimit => {
  const freeLimits = {
    properties: 1,
    agencies: 1, 
    leases: 2,
    users: 1
  };
  
  const maxAllowed = freeLimits[resourceType];
  const allowed = currentCount < maxAllowed;
  const percentageUsed = Math.round((currentCount / maxAllowed) * 100);
  
  return {
    allowed,
    currentCount,
    maxAllowed,
    planName: 'free',
    percentageUsed,
    resourceType,
    isUnlimited: false,
    error: null
  };
};
