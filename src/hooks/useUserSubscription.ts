
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
        console.error('Error loading subscription:', error);
        toast.error('Erreur lors du chargement de l\'abonnement');
        return;
      }
      
      setSubscription(userSub);
      console.log('useUserSubscription: Subscription loaded:', userSub);
      
      // Log les limitations du plan actuel avec plus de détails
      if (userSub?.plan) {
        console.log('useUserSubscription: Plan limits loaded:', {
          planName: userSub.plan.name,
          price: userSub.plan.price,
          maxAgencies: userSub.plan.maxAgencies,
          maxProperties: userSub.plan.maxProperties,
          maxLeases: userSub.plan.maxLeases,
          maxUsers: userSub.plan.maxUsers,
          features: userSub.plan.features
        });
      } else {
        console.warn('useUserSubscription: No plan found in subscription:', userSub);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Erreur lors du chargement de l\'abonnement');
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
    
    // Si on a une erreur dans la vérification des limites, on peut essayer de recharger l'abonnement
    if (result.error && result.error.includes('No active subscription')) {
      console.log('useUserSubscription: No active subscription found, attempting to reload...');
      await loadSubscription(true);
    }
    
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
