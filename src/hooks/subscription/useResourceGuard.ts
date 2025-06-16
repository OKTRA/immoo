import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkUserResourceLimit } from '@/services/subscription/limit';
import { toast } from 'sonner';

export const useResourceGuard = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const canCreateResource = useCallback(async (
    resourceType: 'properties' | 'agencies' | 'leases' | 'users',
    resourceName: string = resourceType,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour effectuer cette action');
      return false;
    }

    setIsChecking(true);
    try {
      const limit = await checkUserResourceLimit(user.id, resourceType);
      
      if (!limit.allowed) {
        toast.error(
          `Limite atteinte : vous ne pouvez pas ajouter plus de ${limit.maxAllowed} ${resourceName} avec votre abonnement actuel.`,
          {
            action: {
              label: 'Mettre à niveau',
              onClick: () => window.open('/pricing', '_blank')
            }
          }
        );
        onError?.();
        return false;
      }

      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification des limites:', error);
      toast.error('Une erreur est survenue lors de la vérification des limites');
      onError?.();
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user?.id]);

  return {
    canCreateResource,
    isChecking
  };
};
