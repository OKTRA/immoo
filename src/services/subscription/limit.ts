
import { supabase } from '@/lib/supabase';
import type { SubscriptionLimit } from './types';

/**
 * Vérifier les limites d'une ressource pour l'utilisateur
 */
export const checkUserResourceLimit = async (
  userId: string,
  resourceType: 'properties' | 'agencies' | 'leases' | 'users',
  agencyId?: string
): Promise<SubscriptionLimit> => {
  try {
    console.log('Checking resource limit for:', { userId, resourceType, agencyId });

    // First, try to get the user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id(
          name,
          price,
          max_properties,
          max_agencies,
          max_leases,
          max_users,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError) {
      console.log('No active subscription found, treating as free plan');
      // No subscription found, apply free plan limits
      const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
      return {
        allowed: currentCount < 1, // Free plan allows 1 of everything
        currentCount,
        maxAllowed: 1,
        planName: 'free',
        percentageUsed: Math.round((currentCount / 1) * 100),
        error: null
      };
    }

    const plan = subscription.subscription_plans;
    if (!plan) {
      console.log('No plan found in subscription, treating as free plan');
      const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
      return {
        allowed: currentCount < 1,
        currentCount,
        maxAllowed: 1,
        planName: 'free',
        percentageUsed: Math.round((currentCount / 1) * 100),
        error: null
      };
    }

    // Get the max allowed for this resource type
    let maxAllowed = 1;
    switch (resourceType) {
      case 'agencies':
        maxAllowed = plan.max_agencies || 1;
        break;
      case 'properties':
        maxAllowed = plan.max_properties || 1;
        break;
      case 'leases':
        maxAllowed = plan.max_leases || 2;
        break;
      case 'users':
        maxAllowed = plan.max_users || 1;
        break;
    }

    // Get current count
    const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
    
    console.log('Resource limit check result:', {
      resourceType,
      currentCount,
      maxAllowed,
      planName: plan.name,
      allowed: currentCount < maxAllowed
    });

    return {
      allowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      planName: plan.name,
      percentageUsed: Math.round((currentCount / maxAllowed) * 100),
      error: null
    };

  } catch (error: any) {
    console.error('Error checking resource limit:', error);
    
    // Fallback: if any error, allow but with basic limits
    const currentCount = await getCurrentResourceCount(userId, resourceType, agencyId);
    return {
      allowed: currentCount < 1, // Conservative fallback
      currentCount,
      maxAllowed: 1,
      planName: 'free',
      percentageUsed: Math.round((currentCount / 1) * 100),
      error: `Failed to check limit: ${error.message}`
    };
  }
};

/**
 * Get current count of resources for a user
 */
const getCurrentResourceCount = async (
  userId: string,
  resourceType: 'properties' | 'agencies' | 'leases' | 'users',
  agencyId?: string
): Promise<number> => {
  try {
    let query;
    
    switch (resourceType) {
      case 'agencies':
        query = supabase
          .from('agencies')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        break;
        
      case 'properties':
        if (agencyId) {
          query = supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('agency_id', agencyId);
        } else {
          // Get properties from all user's agencies
          const { data: agencies } = await supabase
            .from('agencies')
            .select('id')
            .eq('user_id', userId);
          
          if (!agencies || agencies.length === 0) return 0;
          
          const agencyIds = agencies.map(a => a.id);
          query = supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .in('agency_id', agencyIds);
        }
        break;
        
      case 'leases':
        if (agencyId) {
          // Get leases for properties in this agency
          const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .eq('agency_id', agencyId);
          
          if (!properties || properties.length === 0) return 0;
          
          const propertyIds = properties.map(p => p.id);
          query = supabase
            .from('leases')
            .select('id', { count: 'exact', head: true })
            .in('property_id', propertyIds);
        } else {
          // Get leases for all user's properties
          const { data: agencies } = await supabase
            .from('agencies')
            .select('id')
            .eq('user_id', userId);
          
          if (!agencies || agencies.length === 0) return 0;
          
          const { data: properties } = await supabase
            .from('properties')
            .select('id')
            .in('agency_id', agencies.map(a => a.id));
          
          if (!properties || properties.length === 0) return 0;
          
          const propertyIds = properties.map(p => p.id);
          query = supabase
            .from('leases')
            .select('id', { count: 'exact', head: true })
            .in('property_id', propertyIds);
        }
        break;
        
      case 'users':
        if (agencyId) {
          query = supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('agency_id', agencyId);
        } else {
          // Count users across all user's agencies
          const { data: agencies } = await supabase
            .from('agencies')
            .select('id')
            .eq('user_id', userId);
          
          if (!agencies || agencies.length === 0) return 1; // At least the owner
          
          const agencyIds = agencies.map(a => a.id);
          query = supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .in('agency_id', agencyIds);
        }
        break;
        
      default:
        return 0;
    }

    const { count, error } = await query;
    
    if (error) {
      console.error(`Error counting ${resourceType}:`, error);
      return 0;
    }
    
    return count || 0;
    
  } catch (error) {
    console.error(`Error getting ${resourceType} count:`, error);
    return 0;
  }
};
