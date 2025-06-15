import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentUserSubscription,
  checkUserResourceLimit,
  upgradeUserSubscription,
  type UserSubscription,
  type SubscriptionLimit
} from '@/services/subscription';

export const useUserSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async (forceReload = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      if (forceReload) {
        setLoading(true);
      }
      
      console.log('useUserSubscription: Loading subscription for user:', user.id);
      const { subscription: userSub, error } = await getCurrentUserSubscription(user.id);
      
      if (error) {
        console.log('useUserSubscription: No subscription found, setting default free plan');
        // Set a default free subscription for users without one
        setSubscription({
          id: 'default-free',
          user_id: user.id,
          agency_id: null,
          plan_id: 'free-plan',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: null,
          auto_renew: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plan: {
            name: 'free',
            price: 0,
            max_agencies: 1,
            max_properties: 1,
            max_leases: 2,
            max_users: 1,
            features: [],
            billing_cycle: 'monthly',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
        return;
      }
      
      setSubscription(userSub);
      console.log('useUserSubscription: Subscription loaded:', userSub);
      
      // Log les limitations du plan actuel avec plus de détails
      if (userSub?.plan) {
        console.log('useUserSubscription: Plan limits loaded:', {
          planName: userSub.plan.name,
          price: userSub.plan.price,
          maxAgencies: userSub.plan.max_agencies,
          maxProperties: userSub.plan.max_properties,
          maxLeases: userSub.plan.max_leases,
          maxUsers: userSub.plan.max_users,
          features: userSub.plan.features
        });
      } else {
        console.warn('useUserSubscription: No plan found in subscription:', userSub);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      // Set default free plan on error
      setSubscription({
        id: 'default-free',
        user_id: user.id,
        agency_id: null,
        plan_id: 'free-plan',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: null,
        auto_renew: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan: {
          name: 'free',
          price: 0,
          max_agencies: 1,
          max_properties: 1,
          max_leases: 2,
          max_users: 1,
          features: [],
          billing_cycle: 'monthly',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = async (
    resourceType: 'properties' | 'agencies' | 'leases' | 'users',
    agencyId?: string
  ): Promise<SubscriptionLimit> => {
    if (!user?.id) {
      console.log('useUserSubscription: No user ID for limit check');
      return {
        allowed: false,
        currentCount: 0,
        maxAllowed: 0,
        error: 'Utilisateur non connecté'
      };
    }

    console.log('useUserSubscription: Checking limit for:', { 
      resourceType, 
      userId: user.id, 
      agencyId,
      currentSubscription: subscription
    });
    
    const result = await checkUserResourceLimit(user.id, resourceType, agencyId);
    console.log('useUserSubscription: Limit check result:', result);
    
    return result;
  };

  const upgradeSubscription = async (
    newPlanId: string,
    agencyId?: string,
    paymentMethod?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Utilisateur non connecté');
      return false;
    }

    try {
      console.log('useUserSubscription: Upgrading subscription:', { userId: user.id, newPlanId, agencyId });
      const { success, error } = await upgradeUserSubscription(
        user.id,
        newPlanId,
        agencyId,
        paymentMethod
      );

      if (error) {
        toast.error(`Erreur lors de la mise à niveau: ${error}`);
        return false;
      }

      if (success) {
        toast.success('Abonnement mis à niveau avec succès!');
        await loadSubscription(true); // Force reload after upgrade
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Erreur lors de la mise à niveau');
      return false;
    }
  };

  const isFreePlan = (): boolean => {
    if (!subscription?.plan) {
      console.log('useUserSubscription: No plan found, assuming free plan');
      return true;
    }
    
    const isFree = subscription.plan.price === 0 || 
                   subscription.plan.name?.toLowerCase().includes('free') || 
                   subscription.plan.name?.toLowerCase().includes('gratuit');
                   
    console.log('useUserSubscription: Is free plan?', {
      isFree,
      planName: subscription.plan.name,
      planPrice: subscription.plan.price
    });
    
    return isFree;
  };

  const getUsagePercentage = (currentCount: number, maxAllowed: number): number => {
    if (maxAllowed === 0) return 0;
    return Math.round((currentCount / maxAllowed) * 100);
  };

  useEffect(() => {
    loadSubscription();
  }, [user?.id]);

  return {
    subscription,
    loading,
    checkLimit,
    upgradeSubscription,
    isFreePlan,
    getUsagePercentage,
    reloadSubscription: () => loadSubscription(true)
  };
};
