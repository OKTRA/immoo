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
  resourceType: 'properties' | 'agencies' | 'leases' | 'users' | 'tenants',
  agencyId?: string
): Promise<SubscriptionLimit> => {
  try {
    console.log(`🔍 Checking resource limit for user ${userId}, resource: ${resourceType}, agency: ${agencyId}`);
    
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

    console.log(`📊 Subscription query result:`, { subscription, error: subError });

    if (subError || !subscription) {
      console.log(`⚠️ No active subscription found, using database free plan`);
      // No active subscription found, get free plan from database
      const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
      const freePlanResult = await getDatabaseFreePlanLimits(currentCount, resourceType);
      console.log(`🆓 Database free plan result:`, freePlanResult);
      return freePlanResult;
    }

    if (!subscription.subscription_plans) {
      console.log(`⚠️ No plan found in subscription, using database free plan`);
      // No plan found, get free plan from database
      const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
      const freePlanResult = await getDatabaseFreePlanLimits(currentCount, resourceType);
      console.log(`🆓 Database free plan result (no plan):`, freePlanResult);
      return freePlanResult;
    }

    // Get current count of resources
    const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
    console.log(`📈 Current count for ${resourceType}:`, currentCount);
    
    // Get the appropriate limit from the plan
    const plan = subscription.subscription_plans;
    console.log(`📋 Plan details:`, plan);
    
    const limits = {
      properties: plan.max_properties || 1,
      agencies: plan.max_agencies || 1,
      leases: plan.max_leases || 2,
      users: plan.max_users || 1
    };

    const maxAllowed = limits[resourceType];
    console.log(`🎯 Limits for ${resourceType}:`, { maxAllowed, currentCount });
    
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

    console.log(`✅ Final result:`, result);
    return result;
  } catch (error: any) {
    console.error('❌ Error checking user resource limit:', error);
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
  resourceType: 'properties' | 'agencies' | 'leases' | 'users' | 'tenants',
  agencyId?: string
): Promise<number> => {
  try {
    let count = 0;
    
    console.log(`📊 Getting count for ${resourceType}, user: ${userId}, agency: ${agencyId}`);
    
    switch (resourceType) {
      case 'agencies':
        const { count: agencyCount } = await supabase
          .from('agencies')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        count = agencyCount || 0;
        console.log(`🏢 Agency count: ${count}`);
        break;
        
      case 'properties':
        if (agencyId) {
          // Count properties for specific agency
          const { count: propCount } = await supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('agency_id', agencyId);
          count = propCount || 0;
          console.log(`🏠 Property count for agency ${agencyId}: ${count}`);
        } else {
          // First get all user's agency IDs
          const { data: userAgencies } = await supabase
            .from('agencies')
            .select('id')
            .eq('user_id', userId);
          
          if (userAgencies && userAgencies.length > 0) {
            const agencyIds = userAgencies.map(a => a.id);
            console.log(`🏢 User's agency IDs:`, agencyIds);
            
            // Count properties from all user's agencies
            const { count: propCount } = await supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .in('agency_id', agencyIds);
            count = propCount || 0;
          } else {
            count = 0;
          }
          console.log(`🏠 Total property count: ${count}`);
        }
        break;
        
      case 'leases':
        if (agencyId) {
          // First get properties for this agency
          const { data: agencyProperties } = await supabase
            .from('properties')
            .select('id')
            .eq('agency_id', agencyId);
          
          if (agencyProperties && agencyProperties.length > 0) {
            const propertyIds = agencyProperties.map(p => p.id);
            console.log(`🏠 Properties in agency ${agencyId}:`, propertyIds);
            
            // Count leases for these properties
            const { count: leaseCount } = await supabase
              .from('leases')
              .select('id', { count: 'exact', head: true })
              .eq('is_active', true)
              .in('property_id', propertyIds);
            count = leaseCount || 0;
          } else {
            count = 0;
          }
          console.log(`📝 Lease count for agency ${agencyId}: ${count}`);
        } else {
          // First get all user's agency IDs
          const { data: userAgencies } = await supabase
            .from('agencies')
            .select('id')
            .eq('user_id', userId);
          
          if (userAgencies && userAgencies.length > 0) {
            const agencyIds = userAgencies.map(a => a.id);
            
            // Then get all properties from these agencies
            const { data: userProperties } = await supabase
              .from('properties')
              .select('id')
              .in('agency_id', agencyIds);
            
            if (userProperties && userProperties.length > 0) {
              const propertyIds = userProperties.map(p => p.id);
              console.log(`🏠 User's property IDs:`, propertyIds);
              
              // Count leases for all user's properties
              const { count: leaseCount } = await supabase
                .from('leases')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true)
                .in('property_id', propertyIds);
              count = leaseCount || 0;
            } else {
              count = 0;
            }
          } else {
            count = 0;
          }
          console.log(`📝 Total lease count: ${count}`);
        }
        break;
        
      case 'users':
        // For now, just count the user themselves
        count = 1;
        console.log(`👤 User count: ${count}`);
        break;
        
      case 'tenants':
        if (agencyId) {
          // Count tenants for specific agency
          const { count: tenantCount } = await supabase
            .from('tenants')
            .select('id', { count: 'exact', head: true })
            .eq('agency_id', agencyId);
          count = tenantCount || 0;
          console.log(`👤 Tenant count for agency ${agencyId}: ${count}`);
        } else {
          // First get all user's agency IDs
          const { data: userAgencies } = await supabase
            .from('agencies')
            .select('id')
            .eq('user_id', userId);
          
          if (userAgencies && userAgencies.length > 0) {
            const agencyIds = userAgencies.map(a => a.id);
            console.log(`🏢 User's agency IDs:`, agencyIds);
            
            // Count tenants from all user's agencies
            const { count: tenantCount } = await supabase
              .from('tenants')
              .select('id', { count: 'exact', head: true })
              .in('agency_id', agencyIds);
            count = tenantCount || 0;
          } else {
            count = 0;
          }
          console.log(`👤 Total tenant count: ${count}`);
        }
        break;
        
      default:
        count = 0;
    }
    
    console.log(`📊 Final count for ${resourceType}: ${count}`);
    return count;
  } catch (error: any) {
    console.error(`❌ Error getting ${resourceType} count for user ${userId}:`, error);
    return 0;
  }
};

/**
 * Get free plan limits from database instead of hardcoded values
 */
const getDatabaseFreePlanLimits = async (currentCount: number, resourceType: 'properties' | 'agencies' | 'leases' | 'users' | 'tenants'): Promise<SubscriptionLimit> => {
  try {
    // Get the free plan from database
    const { data: freePlan, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (error || !freePlan) {
      console.error('Error fetching free plan from database:', error);
      // Fallback to hardcoded limits if database fails
      return getHardcodedFreePlanLimits(currentCount, resourceType);
    }

    // Map database fields to resource types
    const resourceLimits = {
      properties: freePlan.max_properties,
      agencies: freePlan.max_agencies,
      leases: freePlan.max_leases,
      users: freePlan.max_users,
      tenants: freePlan.max_tenants
    };

    const maxAllowed = resourceLimits[resourceType];
    const allowed = currentCount < maxAllowed;
    const percentageUsed = Math.round((currentCount / maxAllowed) * 100);

    return {
      allowed,
      currentCount,
      maxAllowed,
      planName: freePlan.name,
      planId: freePlan.id,
      percentageUsed,
      resourceType,
      isUnlimited: false,
      error: null
    };
  } catch (err) {
    console.error('Error in getDatabaseFreePlanLimits:', err);
    // Fallback to hardcoded limits
    return getHardcodedFreePlanLimits(currentCount, resourceType);
  }
};

/**
 * Fallback hardcoded free plan limits (only used if database fails)
 */
const getHardcodedFreePlanLimits = (currentCount: number, resourceType: 'properties' | 'agencies' | 'leases' | 'users' | 'tenants'): SubscriptionLimit => {
  const freeLimits = {
    properties: 2, // Updated to match database
    agencies: 1, 
    leases: 2,
    users: 1,
    tenants: 3 // Limite pour les locataires
  };
  
  const maxAllowed = freeLimits[resourceType];
  const allowed = currentCount < maxAllowed;
  const percentageUsed = Math.round((currentCount / maxAllowed) * 100);
  
  return {
    allowed,
    currentCount,
    maxAllowed,
    planName: 'Gratuit (fallback)',
    percentageUsed,
    resourceType,
    isUnlimited: false,
    error: null
  };
};
