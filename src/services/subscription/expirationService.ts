import { supabase } from '@/lib/supabase';
import { getCurrentResourceCount } from './limit';

export const handleSubscriptionExpiry = async (userId: string) => {
  try {
    // 1. Récupérer l'abonnement actif
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      console.error('Aucun abonnement actif trouvé:', subError);
      return;
    }

    const plan = subscription.subscription_plans;
    const now = new Date();
    const endDate = new Date(subscription.end_date);

    // 2. Vérifier si l'abonnement est expiré
    if (now > endDate) {
      // 3. Si c'est un plan payant, basculer vers le plan gratuit
      if (!plan.is_free) {
        await downgradeToFreePlan(userId);
      }
      
      // 4. Désactiver les ressources en trop
      await deactivateExcessResources(userId, plan);
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de l\'expiration:', error);
  }
};

const downgradeToFreePlan = async (userId: string) => {
  // 1. Trouver l'ID du plan gratuit
  const { data: freePlan, error: planError } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('is_free', true)
    .single();

  if (planError || !freePlan) {
    throw new Error('Impossible de trouver le plan gratuit');
  }

  // 2. Mettre à jour l'abonnement
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      plan_id: freePlan.id,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: null, // Pas de date de fin pour le plan gratuit
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (updateError) {
    throw new Error(`Erreur lors du passage au plan gratuit: ${updateError.message}`);
  }
};

const deactivateExcessResources = async (userId: string, plan: any) => {
  // Désactiver les agences en trop
  await deactivateExcessAgencies(userId, plan.max_agencies);
  
  // Désactiver les propriétés en trop
  await deactivateExcessProperties(userId, plan.max_properties);
  
  // Désactiver les baux en trop
  await deactivateExcessLeases(userId, plan.max_leases);
};

const deactivateExcessAgencies = async (userId: string, maxAllowed: number) => {
  // Récupérer toutes les agences actives de l'utilisateur, triées par date de création
  const { data: agencies, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !agencies || agencies.length <= maxAllowed) return;

  // Désactiver les agences en trop (sauf les maxAllowed premières)
  const agenciesToDeactivate = agencies.slice(maxAllowed);
  const agencyIds = agenciesToDeactivate.map(a => a.id);

  await supabase
    .from('agencies')
    .update({ is_active: false })
    .in('id', agencyIds);
};

const deactivateExcessProperties = async (userId: string, maxAllowed: number) => {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !properties || properties.length <= maxAllowed) return;

  const propertiesToDeactivate = properties.slice(maxAllowed);
  const propertyIds = propertiesToDeactivate.map(p => p.id);

  await supabase
    .from('properties')
    .update({ is_active: false })
    .in('id', propertyIds);
};

const deactivateExcessLeases = async (userId: string, maxAllowed: number) => {
  const { data: leases, error } = await supabase
    .from('leases')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !leases || leases.length <= maxAllowed) return;

  const leasesToDeactivate = leases.slice(maxAllowed);
  const leaseIds = leasesToDeactivate.map(l => l.id);

  await supabase
    .from('leases')
    .update({ is_active: false })
    .in('id', leaseIds);
};
