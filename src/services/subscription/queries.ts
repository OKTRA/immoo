
import { supabase } from '@/lib/supabase';
import type { UserSubscription } from './types';

/**
 * Obtenir l'abonnement actuel de l'utilisateur
 */
export const getCurrentUserSubscription = async (userId: string): Promise<{
  subscription: UserSubscription | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (
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
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { subscription: null, error: null };
    }

    const subscription: UserSubscription = {
      id: data.id,
      userId: data.user_id,
      agencyId: data.agency_id,
      planId: data.plan_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      paymentMethod: data.payment_method,
      autoRenew: data.auto_renew,
      plan: data.subscription_plans ? {
        name: data.subscription_plans.name,
        price: data.subscription_plans.price,
        maxProperties: data.subscription_plans.max_properties,
        maxAgencies: data.subscription_plans.max_agencies,
        maxLeases: data.subscription_plans.max_leases,
        maxUsers: data.subscription_plans.max_users,
        features: data.subscription_plans.features || []
      } : undefined
    };

    return { subscription, error: null };
  } catch (error: any) {
    console.error('Error getting user subscription:', error);
    return { subscription: null, error: error.message };
  }
};

/**
 * Obtenir toutes les agences avec leurs abonnements
 */
export const getAgenciesWithSubscriptions = async (): Promise<{
  agencies: Array<{
    id: string;
    name: string;
    logoUrl?: string;
    subscription?: UserSubscription;
  }>;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select(`
        id,
        name,
        logo_url,
        user_id,
        user_subscriptions!inner (
          id,
          plan_id,
          status,
          start_date,
          subscription_plans:plan_id (
            name,
            price,
            max_properties,
            max_agencies,
            max_leases,
            max_users,
            features
          )
        )
      `)
      .eq('user_subscriptions.status', 'active');

    if (error) throw error;

    const agencies = (data || []).map(agency => {
      // Fix the array access issue by checking if user_subscriptions exists and has elements
      const userSubscription = agency.user_subscriptions && agency.user_subscriptions.length > 0 
        ? agency.user_subscriptions[0] 
        : null;

      return {
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logo_url,
        subscription: userSubscription ? {
          id: userSubscription.id,
          userId: agency.user_id,
          agencyId: agency.id,
          planId: userSubscription.plan_id,
          status: userSubscription.status,
          startDate: userSubscription.start_date,
          paymentMethod: '',
          autoRenew: true,
          plan: userSubscription.subscription_plans ? {
            name: userSubscription.subscription_plans[0].name,
            price: userSubscription.subscription_plans[0].price,
            maxProperties: userSubscription.subscription_plans[0].max_properties,
            maxAgencies: userSubscription.subscription_plans[0].max_agencies,
            maxLeases: userSubscription.subscription_plans[0].max_leases,
            maxUsers: userSubscription.subscription_plans[0].max_users,
            features: userSubscription.subscription_plans[0].features || []
          } : undefined
        } : undefined
      };
    });

    return { agencies, error: null };
  } catch (error: any) {
    console.error('Error getting agencies with subscriptions:', error);
    return { agencies: [], error: error.message };
  }
};
