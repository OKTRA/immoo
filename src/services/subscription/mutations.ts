import { supabase } from '@/lib/supabase';
import { calculateSubscriptionEndDate, isSubscriptionExpired } from './index';

/**
 * Mettre à niveau l'abonnement d'un utilisateur selon la logique métier:
 * - Si abonnement actif: upgrade sur la période active (modification du plan, extension de date)
 * - Si abonnement expiré: nouvelle prise d'abonnement à la période dite
 */
export const upgradeUserSubscription = async (
  userId: string,
  newPlanId: string,
  agencyId?: string,
  paymentMethod?: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // 1. Vérifier l'abonnement actuel
    const { data: currentSubscription, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (checkError) throw checkError;

    const now = new Date();
    const isCurrentSubscriptionActive = currentSubscription && 
      !isSubscriptionExpired(currentSubscription.end_date);

    if (isCurrentSubscriptionActive) {
      // UPGRADE SUR PÉRIODE ACTIVE
      console.log('Upgrade sur période active détecté');
      
      // Mettre à jour l'abonnement existant (pas de création de nouveau)
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          plan_id: newPlanId,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
          // Conserver start_date et end_date existants pour l'upgrade
        })
        .eq('id', currentSubscription.id);

      if (updateError) throw updateError;
      
    } else {
      // NOUVELLE PRISE D'ABONNEMENT
      console.log('Nouvelle prise d\'abonnement détectée');
      
      // Désactiver tous les anciens abonnements (expired, cancelled, etc.)
      const { error: deactivateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', end_date: now.toISOString() })
        .eq('user_id', userId)
        .neq('status', 'cancelled');

      if (deactivateError) throw deactivateError;

      // Récupérer les infos du plan pour calculer la date de fin
      const { data: planInfo, error: planError } = await supabase
        .from('subscription_plans')
        .select('billing_cycle')
        .eq('id', newPlanId)
        .single();

      if (planError) throw planError;

      // Calculer la date de fin selon le cycle de facturation
      const endDate = calculateSubscriptionEndDate(now, planInfo.billing_cycle);

      // Créer un nouvel abonnement avec dates fraîches
      const { error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          agency_id: agencyId,
          plan_id: newPlanId,
          status: 'active',
          payment_method: paymentMethod,
          start_date: now.toISOString(),
          end_date: endDate.toISOString()
        });

      if (createError) throw createError;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifier le statut de l'abonnement actuel d'un utilisateur
 */
export const checkUserSubscriptionStatus = async (userId: string): Promise<{
  hasActiveSubscription: boolean;
  subscription: any | null;
  isExpired: boolean;
  error: string | null;
}> => {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;

    if (!subscription) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        isExpired: false,
        error: null
      };
    }

    const now = new Date();
    const isExpired = subscription.end_date && new Date(subscription.end_date) <= now;

    return {
      hasActiveSubscription: !isExpired,
      subscription,
      isExpired: !!isExpired,
      error: null
    };

  } catch (error: any) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      isExpired: false,
      error: error.message
    };
  }
};
