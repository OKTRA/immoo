
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
    const params = {
      user_id: userId,
      resource_type: resourceType,
      agency_id: agencyId || null
    };
    console.log('Attempting to call check_subscription_limit with params:', params);

    const { data, error } = await supabase.rpc('check_subscription_limit', params);

    if (error) {
      console.error('Error calling check_subscription_limit RPC:', error);
      throw error;
    }
    
    console.log('RPC check_subscription_limit successful, data:', data);

    return {
      allowed: data.allowed,
      currentCount: data.current_count,
      maxAllowed: data.max_allowed,
      planName: data.plan_name,
      percentageUsed: data.percentage_used,
      error: data.error
    };
  } catch (error: any) {
    console.error('Error checking resource limit:', error);
    return {
      allowed: false,
      currentCount: 0,
      maxAllowed: 0,
      error: `Failed to check limit: ${error.message}`
    };
  }
};
