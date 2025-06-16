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
      
      const { subscription: userSub, error } = await getCurrentUserSubscription(user.id);
      
      if (error || !userSub) {
        const defaultSub = createDefaultFreeSubscription(user.id);
        setSubscription(defaultSub as UserSubscription);
        return;
      }
      
      setSubscription(userSub);
      
      if (userSub?.plan) {
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
