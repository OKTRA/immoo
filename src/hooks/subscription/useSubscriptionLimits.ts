
import { useAuth } from '@/hooks/useAuth';
import { checkUserResourceLimit, type SubscriptionLimit } from '@/services/subscription';

export const useSubscriptionLimits = () => {
  const { user } = useAuth();

  const checkLimit = async (
    resourceType: 'properties' | 'agencies' | 'leases' | 'users',
    agencyId?: string
  ): Promise<SubscriptionLimit> => {
    if (!user?.id) {
      console.log('useSubscriptionLimits: No user ID for limit check');
      return {
        allowed: false,
        currentCount: 0,
        maxAllowed: 0,
        error: 'Utilisateur non connecté'
      };
    }

    console.log('useSubscriptionLimits: Checking limit for:', { 
      resourceType, 
      userId: user.id, 
      agencyId
    });
    
    const result = await checkUserResourceLimit(user.id, resourceType, agencyId);
    console.log('useSubscriptionLimits: Limit check result:', result);
    
    return result;
  };

  const getUsagePercentage = (currentCount: number, maxAllowed: number): number => {
    if (maxAllowed === 0) return 0;
    return Math.round((currentCount / maxAllowed) * 100);
  };

  return {
    checkLimit,
    getUsagePercentage
  };
};
