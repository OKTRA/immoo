import { type UserSubscription } from '@/services/subscription';

export const useSubscriptionUtils = (subscription: UserSubscription | null) => {
  const isFreePlan = (): boolean => {
    if (!subscription?.plan) {
      return true;
    }

    const result = subscription.plan.name === 'Gratuit' || subscription.plan.price === 0;
    return result;
  };

  return {
    isFreePlan
  };
};
