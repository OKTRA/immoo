import { supabase, handleSupabaseError } from '@/lib/supabase';
import { SubscriptionPlan } from '@/assets/types';

/**
 * Get all subscription plans
 */
export const getAllSubscriptionPlans = async (activeOnly = true) => {
  try {
    let query = supabase
      .from('subscription_plans')
      .select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('price', { ascending: true });

    if (error) throw error;
    
    const plans: SubscriptionPlan[] = data.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billing_cycle,
      features: plan.features || [],
      isActive: plan.is_active,
      maxProperties: plan.max_properties,
      maxUsers: plan.max_users,
      maxAgencies: plan.max_agencies,
      maxLeases: plan.max_leases,
      hasApiAccess: plan.has_api_access
    }));
    
    return { plans, error: null };
  } catch (error: any) {
    console.error('Error getting subscription plans:', error);
    return { plans: [], error: error.message };
  }
};

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlanById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    const plan: SubscriptionPlan = {
      id: data.id,
      name: data.name,
      price: data.price,
      billingCycle: data.billing_cycle,
      features: data.features || [],
      isActive: data.is_active,
      maxProperties: data.max_properties,
      maxUsers: data.max_users,
      maxAgencies: data.max_agencies,
      maxLeases: data.max_leases,
      hasApiAccess: data.has_api_access
    };
    
    return { plan, error: null };
  } catch (error: any) {
    console.error(`Error getting subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Create a new subscription plan (admin only)
 */
export const createSubscriptionPlan = async (planData: Omit<SubscriptionPlan, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([{
        name: planData.name,
        price: planData.price,
        billing_cycle: planData.billingCycle,
        features: planData.features,
        is_active: planData.isActive,
        max_properties: planData.maxProperties,
        max_users: planData.maxUsers,
        max_agencies: planData.maxAgencies,
        max_leases: planData.maxLeases,
        has_api_access: planData.hasApiAccess
      }])
      .select()
      .single();

    if (error) throw error;
    
    const plan: SubscriptionPlan = {
      id: data.id,
      name: data.name,
      price: data.price,
      billingCycle: data.billing_cycle,
      features: data.features || [],
      isActive: data.is_active,
      maxProperties: data.max_properties,
      maxUsers: data.max_users,
      maxAgencies: data.max_agencies,
      maxLeases: data.max_leases,
      hasApiAccess: data.has_api_access
    };
    
    return { plan, error: null };
  } catch (error: any) {
    console.error('Error creating subscription plan:', error);
    return { plan: null, error: error.message };
  }
};

/**
 * Update a subscription plan (admin only)
 */
export const updateSubscriptionPlan = async (id: string, planData: Partial<SubscriptionPlan>) => {
  try {
    const updateData: any = {};
    if (planData.name !== undefined) updateData.name = planData.name;
    if (planData.price !== undefined) updateData.price = planData.price;
    if (planData.billingCycle !== undefined) updateData.billing_cycle = planData.billingCycle;
    if (planData.features !== undefined) updateData.features = planData.features;
    if (planData.isActive !== undefined) updateData.is_active = planData.isActive;
    if (planData.maxProperties !== undefined) updateData.max_properties = planData.maxProperties;
    if (planData.maxUsers !== undefined) updateData.max_users = planData.maxUsers;
    if (planData.maxAgencies !== undefined) updateData.max_agencies = planData.maxAgencies;
    if (planData.maxLeases !== undefined) updateData.max_leases = planData.maxLeases;
    if (planData.hasApiAccess !== undefined) updateData.has_api_access = planData.hasApiAccess;

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const plan: SubscriptionPlan = {
      id: data.id,
      name: data.name,
      price: data.price,
      billingCycle: data.billing_cycle,
      features: data.features || [],
      isActive: data.is_active,
      maxProperties: data.max_properties,
      maxUsers: data.max_users,
      maxAgencies: data.max_agencies,
      maxLeases: data.max_leases,
      hasApiAccess: data.has_api_access
    };
    
    return { plan, error: null };
  } catch (error: any) {
    console.error(`Error updating subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Delete a subscription plan (admin only)
 */
export const deleteSubscriptionPlan = async (id: string) => {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting subscription plan with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user subscription
 */
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    return { subscription: data, error: null };
  } catch (error: any) {
    console.error(`Error getting subscription for user ${userId}:`, error);
    return { subscription: null, error: error.message };
  }
};

/**
 * Check if user has reached limit for a resource - CORRECTED VERSION
 */
export const checkResourceLimit = async (userId: string, resourceType: 'properties' | 'agencies' | 'leases' | 'users') => {
  try {
    // Get user's current subscription
    const { subscription, error: subError } = await getUserSubscription(userId);
    if (subError || !subscription) {
      return { hasLimit: true, currentCount: 0, maxAllowed: 1, error: 'No active subscription' };
    }

    // Get current count based on resource type - CORRECTED LOGIC
    let currentCount = 0;
    switch (resourceType) {
      case 'properties':
        // FIXED: Count properties via agencies relationship
        const { data: agencies } = await supabase
          .from('agencies')
          .select('id')
          .eq('user_id', userId);
        
        if (agencies && agencies.length > 0) {
          const agencyIds = agencies.map(a => a.id);
          const { count: propCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .in('agency_id', agencyIds);
          currentCount = propCount || 0;
        }
        break;
        
      case 'agencies':
        const { count: agencyCount } = await supabase
          .from('agencies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        currentCount = agencyCount || 0;
        break;
        
      case 'leases':
        // FIXED: Count leases via properties->agencies relationship
        const { data: userAgencies } = await supabase
          .from('agencies')
          .select('id')
          .eq('user_id', userId);
        
        if (userAgencies && userAgencies.length > 0) {
          const { data: userProperties } = await supabase
            .from('properties')
            .select('id')
            .in('agency_id', userAgencies.map(a => a.id));
          
          if (userProperties && userProperties.length > 0) {
            const propertyIds = userProperties.map(p => p.id);
            const { count: leaseCount } = await supabase
              .from('leases')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
              .eq('is_active', true);
            currentCount = leaseCount || 0;
          }
        }
        break;
    }

    const plan = subscription.subscription_plans;
    const maxAllowed = resourceType === 'properties' ? plan.max_properties :
                      resourceType === 'agencies' ? plan.max_agencies :
                      resourceType === 'leases' ? plan.max_leases :
                      plan.max_users;

    return {
      hasLimit: currentCount >= maxAllowed,
      currentCount,
      maxAllowed,
      error: null
    };
  } catch (error: any) {
    console.error(`Error checking resource limit for ${resourceType}:`, error);
    return { hasLimit: true, currentCount: 0, maxAllowed: 1, error: error.message };
  }
};
