import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkUserResourceLimit, type SubscriptionLimit } from '@/services/subscription/limit';
import { handleSubscriptionExpiry } from '@/services/subscription/expirationService';

export const useSubscriptionLimits = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [limits, setLimits] = useState<{
    properties: SubscriptionLimit;
    agencies: SubscriptionLimit;
    leases: SubscriptionLimit;
    users: SubscriptionLimit;
    anyLimitReached: boolean;
  } | null>(null);

  // Vérifier l'expiration de l'abonnement et charger les limites
  useEffect(() => {
    const checkExpiryAndLoadLimits = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Vérifier l'expiration de l'abonnement
        await handleSubscriptionExpiry(user.id);
        
        // Charger toutes les limites
        const [properties, agencies, leases, users] = await Promise.all([
          checkUserResourceLimit(user.id, 'properties'),
          checkUserResourceLimit(user.id, 'agencies'),
          checkUserResourceLimit(user.id, 'leases'),
          checkUserResourceLimit(user.id, 'users'),
        ]);

        setLimits({
          properties,
          agencies,
          leases,
          users,
          anyLimitReached: 
            !properties.allowed || 
            !agencies.allowed || 
            !leases.allowed || 
            !users.allowed
        });
      } catch (error) {
        console.error('Erreur lors du chargement des limites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExpiryAndLoadLimits();
    
    // Vérifier périodiquement (toutes les heures)
    const interval = setInterval(checkExpiryAndLoadLimits, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const checkLimit = async (
    resourceType: 'properties' | 'agencies' | 'leases' | 'users',
    agencyId?: string
  ): Promise<SubscriptionLimit> => {
    if (!user?.id) {
      return {
        allowed: false,
        currentCount: 0,
        maxAllowed: 0,
        error: 'Utilisateur non connecté',
        percentageUsed: 100
      };
    }

    try {
      const result = await checkUserResourceLimit(user.id, resourceType, agencyId);
      return result;
    } catch (error) {
      console.error('Erreur lors de la vérification de la limite:', error);
      return {
        allowed: false,
        currentCount: 0,
        maxAllowed: 0,
        error: 'Erreur lors de la vérification de la limite',
        percentageUsed: 100
      };
    }
  };

  const getUsagePercentage = (currentCount: number, maxAllowed: number): number => {
    if (maxAllowed === 0) return 100;
    return Math.min(Math.round((currentCount / maxAllowed) * 100), 100);
  };

  return {
    checkLimit,
    getUsagePercentage,
    limits,
    isLoading
  };
};
