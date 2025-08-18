import { supabase } from '@/lib/supabase';

export interface SubscriptionPaymentMethod {
  id: string;
  provider: string;
  phone_number: string;
  is_active: boolean;
  display_order: number;
  applicable_plans?: string[] | null;
}

// Fallback data if table doesn't exist
const FALLBACK_PAYMENT_METHODS: SubscriptionPaymentMethod[] = [
  {
    id: 'fallback-1',
    provider: 'Orange Money',
    phone_number: '+223 77 01 02 02',
    is_active: true,
    display_order: 0,
    applicable_plans: null
  },
  {
    id: 'fallback-2', 
    provider: 'Moov Money',
    phone_number: '+223 99 99 99 99',
    is_active: true,
    display_order: 1,
    applicable_plans: null
  },
  {
    id: 'fallback-3',
    provider: 'Wave',
    phone_number: '+223 80 00 00 00', 
    is_active: true,
    display_order: 2,
    applicable_plans: null
  }
];

export const listSubscriptionPaymentMethods = async (planId?: string) => {
  console.log('📱 Fetching payment methods for plan:', planId);
  
  try {
    const query = supabase
      .from('subscription_payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    const { data, error } = await query;
    
    console.log('📱 Payment methods query result:', { data, error });
    
    if (error) {
      // If table doesn't exist (404 error), use fallback data
      if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
        console.warn('⚠️ Table subscription_payment_methods does not exist, using fallback data');
        return FALLBACK_PAYMENT_METHODS;
      }
      console.error('❌ Error fetching payment methods:', error);
      throw error;
    }

    const methods = (data as SubscriptionPaymentMethod[]) || [];
    console.log('📱 All payment methods:', methods);
    
    // If no data found, use fallback
    if (methods.length === 0) {
      console.warn('⚠️ No payment methods found in database, using fallback data');
      return FALLBACK_PAYMENT_METHODS;
    }
    
    if (!planId) return methods;

    // Filter: applicable_plans null => all; else must contain planId
    const filtered = methods.filter(m => !m.applicable_plans || m.applicable_plans.includes(planId));
    console.log('📱 Filtered payment methods for plan', planId, ':', filtered);
    
    return filtered;
  } catch (error) {
    console.error('❌ Critical error fetching payment methods, using fallback:', error);
    return FALLBACK_PAYMENT_METHODS;
  }
};

export const createSubscriptionPaymentMethod = async (payload: Omit<SubscriptionPaymentMethod, 'id' | 'is_active'> & { is_active?: boolean }) => {
  const { data, error } = await supabase
    .from('subscription_payment_methods')
    .insert({
      provider: payload.provider,
      phone_number: payload.phone_number,
      display_order: payload.display_order ?? 0,
      applicable_plans: payload.applicable_plans ?? null,
      is_active: payload.is_active ?? true,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as SubscriptionPaymentMethod;
};

export const updateSubscriptionPaymentMethod = async (id: string, updates: Partial<SubscriptionPaymentMethod>) => {
  const { data, error } = await supabase
    .from('subscription_payment_methods')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as SubscriptionPaymentMethod;
};

export const deleteSubscriptionPaymentMethod = async (id: string) => {
  const { error } = await supabase
    .from('subscription_payment_methods')
    .delete()
    .eq('id', id);
  if (error) throw error;
};


