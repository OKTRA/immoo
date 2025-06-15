
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserSubscription, type UserSubscription } from '@/services/subscription';
import { createDefaultFreeSubscription } from './defaults';

export const useSubscriptionLoader = () => {
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
      
      console.log('useSubscriptionLoader: Loading subscription for user:', user.id);
      const { subscription: userSub, error } = await getCurrentUserSubscription(user.id);
      
      if (error) {
        console.log('useSubscriptionLoader: No subscription found, setting default free plan');
        const defaultSub = createDefaultFreeSubscription(user.id);
        setSubscription(defaultSub as UserSubscription);
        return;
      }
      
      setSubscription(userSub);
      console.log('useSubscriptionLoader: Subscription loaded:', userSub);
      
      if (userSub?.plan) {
        console.log('useSubscriptionLoader: Plan limits loaded:', {
          planName: userSub.plan.name,
          price: userSub.plan.price,
          maxAgencies: userSub.plan.maxAgencies,
          maxProperties: userSub.plan.maxProperties,
          maxLeases: userSub.plan.maxLeases,
          maxUsers: userSub.plan.maxUsers,
          features: userSub.plan.features
        });
      } else {
        console.warn('useSubscriptionLoader: No plan found in subscription:', userSub);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      const defaultSub = createDefaultFreeSubscription(user.id);
      setSubscription(defaultSub as UserSubscription);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    loadSubscription,
    setSubscription
  };
};
