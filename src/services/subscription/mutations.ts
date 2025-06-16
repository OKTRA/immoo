
import { supabase } from '@/lib/supabase';

/**
 * Mettre à niveau l'abonnement d'un utilisateur
 */
export const upgradeUserSubscription = async (
  userId: string,
  newPlanId: string,
  agencyId?: string,
  paymentMethod?: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Désactiver l'ancien abonnement
    const { error: deactivateError } = await supabase
      .from('user_subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (deactivateError) throw deactivateError;

    // Créer le nouvel abonnement
    const { error: createError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        agency_id: agencyId,
        plan_id: newPlanId,
        status: 'active',
        payment_method: paymentMethod,
        start_date: new Date().toISOString()
      });

    if (createError) throw createError;

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    return { success: false, error: error.message };
  }
};
