
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  getCurrentUserSubscription,
  checkUserResourceLimit,
  upgradeUserSubscription,
  type UserSubscription,
  type SubscriptionLimit
} from '@/services/userSubscriptionService';

export const useUserSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { subscription: userSub, error } = await getCurrentUserSubscription(user.id);
      
      if (error) {
        console.error('Error loading subscription:', error);
        toast.error('Erreur lors du chargement de l\'abonnement');
        return;
      }
      
      setSubscription(userSub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = async (
    resourceType: 'properties' | 'agencies' | 'leases' | 'users',
    agencyId?: string
  ): Promise<SubscriptionLimit> => {
    if (!user?.id) {
      return {
        allowed: false,
        currentCount: 0,
        maxAllowed: 0,
        error: 'Utilisateur non connecté'
      };
    }

    return await checkUserResourceLimit(user.id, resourceType, agencyId);
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
        await loadSubscription(); // Recharger l'abonnement
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
    return subscription?.plan?.price === 0 || subscription?.plan?.name?.toLowerCase().includes('free') || false;
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
    reloadSubscription: loadSubscription
  };
};
