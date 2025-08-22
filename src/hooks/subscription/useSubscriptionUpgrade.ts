
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { upgradeUserSubscription } from '@/services/subscription';

export const useSubscriptionUpgrade = (reloadSubscription: () => Promise<void>) => {
  const { user } = useAuth();

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
      console.log('useSubscriptionUpgrade: Upgrading subscription:', { userId: user.id, newPlanId, agencyId });
      const { success, error } = await upgradeUserSubscription(
        user.id,
        newPlanId,
        agencyId,
        paymentMethod
      );

      if (error) {
        throw new Error(error);
      }
      // Abonnement mis à niveau avec succès!
      await reloadSubscription();
      return true;
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      toast.error(`Erreur lors de la mise à niveau: ${error}`);
      return false;
    }
  };

  return {
    upgradeSubscription
  };
};
