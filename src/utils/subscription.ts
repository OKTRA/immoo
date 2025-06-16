import { supabase } from '@/lib/supabase';

export const checkActiveSubscription = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return !!data && data.status === 'active';
};

export const getSubscriptionPlan = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Return free plan as default
    return {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      max_agencies: 1,
      max_properties: 1,
      max_leases: 2,
      max_users: 1,
      is_free: true,
      features: [
        '1 agence',
        '1 propriété',
        '2 baux',
        '1 utilisateur',
        'Support de base'
      ]
    };
  }

  return data.subscription_plans;
};
