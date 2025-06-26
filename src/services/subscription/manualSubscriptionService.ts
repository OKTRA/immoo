import { supabase } from '@/lib/supabase';

export interface UserAgency {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  agency_id?: string;
  agency_name?: string;
  current_plan?: string;
  current_plan_id?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  max_properties: number;
  max_agencies: number;
  max_leases: number;
  max_users: number;
  features: string[];
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  requires_verification: boolean;
  processing_fee_percentage: number;
  processing_fee_fixed: number;
}

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount: number;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  applicable_plans?: string[];
}

export interface PromoCodeValidation {
  valid: boolean;
  error?: string;
  promo_code_id?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  promo_name?: string;
  description?: string;
}

export interface ManualSubscriptionActivation {
  userId: string;
  planId: string;
  paymentMethodId: string;
  promoCode?: string;
  adminNote?: string;
}

export class ManualSubscriptionService {
  /**
   * Récupère tous les utilisateurs d'agences avec leurs abonnements actuels
   */
  static async getUserAgencies(): Promise<UserAgency[]> {
    // Récupérer les utilisateurs avec leurs agences
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        agency_id,
        role
      `)
      .not('agency_id', 'is', null)
      .eq('role', 'agency');

    if (usersError) throw usersError;

    if (!users || users.length === 0) return [];

    // Récupérer les agences
    const agencyIds = [...new Set(users.map(u => u.agency_id).filter(Boolean))];
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id, name')
      .in('id', agencyIds);

    // Récupérer les abonnements actifs
    const userIds = users.map(u => u.id);
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select(`
        user_id,
        plan_id,
        status,
        subscription_plans(id, name)
      `)
      .in('user_id', userIds)
      .eq('status', 'active');

    // Créer les maps pour les lookups
    const agenciesMap = new Map((agencies || []).map(a => [a.id, a]));
    const subscriptionsMap = new Map((subscriptions || []).map(s => [s.user_id, s]));

    return users.map(user => {
      const agency = agenciesMap.get(user.agency_id);
      const subscription = subscriptionsMap.get(user.id);

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        agency_id: user.agency_id,
        agency_name: agency?.name || 'N/A',
        current_plan: (subscription?.subscription_plans as any)?.name || 'Aucun',
        current_plan_id: subscription?.plan_id || null
      };
    });
  }

  /**
   * Récupère tous les plans d'abonnement actifs
   */
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return (plans as SubscriptionPlan[]) || [];
  }

  /**
   * Récupère toutes les méthodes de paiement actives
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data: methods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (methods as PaymentMethod[]) || [];
  }

  /**
   * Récupère tous les codes promo actifs
   */
  static async getPromoCodes(): Promise<PromoCode[]> {
    const { data: codes, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (codes as PromoCode[]) || [];
  }

  /**
   * Valide un code promo pour un utilisateur et un plan donnés
   */
  static async validatePromoCode(
    code: string,
    userId: string,
    planId: string,
    amount: number
  ): Promise<PromoCodeValidation> {
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code,
      p_user_id: userId,
      p_plan_id: planId,
      p_amount: amount
    });

    if (error) throw error;
    return data as PromoCodeValidation;
  }

  /**
   * Active ou upgrade manuellement un abonnement avec code promo et méthode de paiement
   */
  static async activateSubscription(activation: ManualSubscriptionActivation): Promise<void> {
    const { userId, planId, paymentMethodId, promoCode, adminNote } = activation;

    // Récupérer les informations de l'utilisateur et du plan
    const [userResult, planResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, first_name, last_name, agency_id')
        .eq('id', userId)
        .single(),
      supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()
    ]);

    if (userResult.error) throw userResult.error;
    if (planResult.error) throw planResult.error;

    const user = userResult.data;
    const plan = planResult.data;

    if (!user.agency_id) {
      throw new Error('L\'utilisateur n\'est associé à aucune agence');
    }

    // Utiliser la nouvelle fonction RPC avec support des codes promo
    const { data: result, error: transactionError } = await supabase.rpc('activate_subscription_with_promo', {
      p_user_id: userId,
      p_agency_id: user.agency_id,
      p_plan_id: planId,
      p_amount: plan.price,
      p_payment_method_id: paymentMethodId,
      p_promo_code: promoCode || null,
      p_admin_note: adminNote || `Activation manuelle du plan ${plan.name} par l'administrateur`
    });

    if (transactionError) {
      throw new Error(`Erreur lors de l'activation: ${transactionError.message}`);
    }

    if (!result?.success) {
      throw new Error(result?.error || 'Erreur inconnue lors de l\'activation');
    }

    return result;
  }

  /**
   * Créer un nouveau code promo
   */
  static async createPromoCode(promoCode: Omit<PromoCode, 'id' | 'usage_count'>): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .insert({
        ...promoCode,
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) throw error;
  }

  /**
   * Mettre à jour un code promo
   */
  static async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Désactiver un code promo
   */
  static async deactivatePromoCode(id: string): Promise<void> {
    const { error } = await supabase
      .from('promo_codes')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Récupérer l'historique d'utilisation d'un code promo
   */
  static async getPromoCodeUsageHistory(promoCodeId: string) {
    const { data, error } = await supabase
      .from('promo_code_usages')
      .select(`
        *,
        profiles!user_id(email, first_name, last_name),
        user_subscriptions!subscription_id(
          subscription_plans(name)
        )
      `)
      .eq('promo_code_id', promoCodeId)
      .order('used_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupérer l'historique des activations avec codes promo et méthodes de paiement
   */
  static async getEnhancedActivationHistory(limit: number = 50) {
    const { data, error } = await supabase
      .from('billing_history')
      .select(`
        *,
        profiles!user_id(email, first_name, last_name),
        agencies!agency_id(name),
        subscription_plans!plan_id(name),
        payment_methods!payment_method_id(name, code),
        promo_codes!promo_code_id(code, name, discount_type, discount_value)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Vérifie si un utilisateur peut être upgradé vers un plan spécifique
   * selon la nouvelle logique: abonnement actif = upgrade, expiré = nouvelle prise
   */
  static async canUpgradeToPlan(userId: string, planId: string): Promise<{
    canUpgrade: boolean;
    reason?: string;
    currentPlan?: SubscriptionPlan;
    targetPlan?: SubscriptionPlan;
    isUpgrade?: boolean; // true = upgrade sur période active, false = nouvelle prise
  }> {
    try {
      // Récupérer l'abonnement actuel de l'utilisateur
      const { data: currentSub, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) throw subError;

      // Récupérer le plan cible
      const { data: targetPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      if (!targetPlan.is_active) {
        return {
          canUpgrade: false,
          reason: 'Le plan cible n\'est plus actif',
          targetPlan
        };
      }

      if (!currentSub) {
        // Aucun abonnement actuel = nouvelle prise d'abonnement
        return {
          canUpgrade: true,
          reason: 'Aucun abonnement actuel, nouvelle activation possible',
          targetPlan,
          isUpgrade: false
        };
      }

      // Vérifier si l'abonnement actuel est encore valide (non expiré)
      const now = new Date();
      const isCurrentSubscriptionActive = !currentSub.end_date || new Date(currentSub.end_date) > now;

      const currentPlan = currentSub.subscription_plans as unknown as SubscriptionPlan;

      if (currentSub.plan_id === planId) {
        return {
          canUpgrade: false,
          reason: 'L\'utilisateur a déjà ce plan actif',
          currentPlan,
          targetPlan: targetPlan as SubscriptionPlan,
          isUpgrade: isCurrentSubscriptionActive
        };
      }

      if (isCurrentSubscriptionActive) {
        // Abonnement actif = upgrade sur période en cours
        return {
          canUpgrade: true,
          reason: `Upgrade possible vers ${targetPlan.name} (période active conservée)`,
          currentPlan,
          targetPlan: targetPlan as SubscriptionPlan,
          isUpgrade: true
        };
      } else {
        // Abonnement expiré = nouvelle prise d'abonnement
      return {
        canUpgrade: true,
          reason: `Nouvelle activation possible vers ${targetPlan.name} (abonnement expiré)`,
        currentPlan,
          targetPlan: targetPlan as SubscriptionPlan,
          isUpgrade: false
      };
      }

    } catch (error) {
      return {
        canUpgrade: false,
        reason: 'Erreur lors de la vérification'
      };
    }
  }

  /**
   * Récupère l'historique des activations manuelles
   */
  static async getManualActivationHistory(limit: number = 50) {
    const { data, error } = await supabase
      .from('billing_history')
      .select(`
        *,
        profiles(email, first_name, last_name),
        agencies(name),
        subscription_plans(name, price)
      `)
      .eq('payment_method', 'manual_activation')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }



  /**
   * Détecte les doublons d'activations manuelles
   */
  static async detectDuplicateActivations() {
    const { data, error } = await supabase
      .from('recent_manual_activations')
      .select('*');

    if (error) throw error;

    // Grouper par utilisateur et plan pour détecter les doublons
    const grouped = new Map();
    
    data?.forEach(activation => {
      const key = `${activation.user_id}_${activation.plan_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(activation);
    });

    // Filtrer seulement les groupes avec plus d'une activation
    const duplicates = Array.from(grouped.entries())
      .filter(([_, activations]) => activations.length > 1)
      .map(([key, activations]) => ({
        key,
        count: activations.length,
        activations: activations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        user_email: activations[0].user_email,
        plan_name: activations[0].plan_name,
        total_amount: activations.reduce((sum, a) => sum + parseFloat(a.amount), 0)
      }));

    return duplicates;
  }

  /**
   * Vérifie s'il y a eu une activation récente pour éviter les doublons
   */
  static async checkRecentActivation(userId: string, planId: string, windowMinutes: number = 5): Promise<{
    hasRecent: boolean;
    lastActivation?: any;
    message?: string;
  }> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('billing_history')
      .select(`
        *,
        subscription_plans(name)
      `)
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('payment_method', 'manual_activation')
      .eq('status', 'paid')
      .gte('created_at', windowStart)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const lastActivation = data[0];
      const timeDiff = Date.now() - new Date(lastActivation.created_at).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      return {
        hasRecent: true,
        lastActivation,
        message: `Une activation du plan ${lastActivation.subscription_plans?.name} a été effectuée il y a ${minutesAgo} minute(s). Veuillez attendre ${windowMinutes - minutesAgo} minute(s) avant de réessayer.`
      };
    }

    return { hasRecent: false };
  }

  /**
   * Active ou upgrade manuellement un abonnement avec vérifications anti-doublons
   */
  static async activateSubscriptionWithProtection(activation: ManualSubscriptionActivation): Promise<void> {
    const { userId, planId } = activation;

    // 1. Vérifier s'il y a eu une activation récente
    const recentCheck = await this.checkRecentActivation(userId, planId);
    if (recentCheck.hasRecent) {
      throw new Error(recentCheck.message || 'Activation récente détectée');
    }

    // 2. Vérifier si l'utilisateur a déjà ce plan actif (upgrade vs nouvelle activation)
    const upgradeCheck = await this.canUpgradeToPlan(userId, planId);
    if (!upgradeCheck.canUpgrade && upgradeCheck.reason?.includes('déjà ce plan')) {
      throw new Error(upgradeCheck.reason);
    }

    // 3. Procéder à l'activation normale
    return this.activateSubscription(activation);
  }
} 