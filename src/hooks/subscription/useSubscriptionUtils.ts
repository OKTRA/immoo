
import { type UserSubscription } from '@/services/subscription';

export const useSubscriptionUtils = (subscription: UserSubscription | null) => {
  const isFreePlan = (): boolean => {
    if (!subscription?.plan) {
      console.log('useSubscriptionUtils: No plan found, assuming free plan');
      return true;
    }
    
    const isFree = subscription.plan.price === 0 || 
                   subscription.plan.name?.toLowerCase().includes('free') || 
                   subscription.plan.name?.toLowerCase().includes('gratuit');
                   
    console.log('useSubscriptionUtils: Is free plan?', {
      isFree,
      planName: subscription.plan.name,
      planPrice: subscription.plan.price
    });
    
    return isFree;
  };

  return {
    isFreePlan
  };
};
