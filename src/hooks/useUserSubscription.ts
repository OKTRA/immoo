
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionLoader } from './subscription/useSubscriptionLoader';
import { useSubscriptionLimits } from './subscription/useSubscriptionLimits';
import { useSubscriptionUpgrade } from './subscription/useSubscriptionUpgrade';
import { useSubscriptionUtils } from './subscription/useSubscriptionUtils';

export const useUserSubscription = () => {
  const { user } = useAuth();
  const { subscription, loading, loadSubscription } = useSubscriptionLoader();
  const { checkLimit, getUsagePercentage } = useSubscriptionLimits();
  const { upgradeSubscription } = useSubscriptionUpgrade(() => loadSubscription(true));
  const { isFreePlan } = useSubscriptionUtils(subscription);

  useEffect(() => {
    if (user?.id) {
      loadSubscription();
    }
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
