
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { upgradeUserSubscription } from '@/services/subscription';
import { checkCinetPayPaymentStatus } from '@/services/payment/cinetpayService';

export const useSubscriptionPayment = () => {
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState(false);

  const processSubscriptionPayment = async (
    planId: string,
    transactionId: string,
    agencyId?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Utilisateur non connecté');
      return false;
    }

    try {
      setProcessingPayment(true);
      console.log('Processing subscription payment:', { planId, transactionId, agencyId });

      // Vérifier le statut du paiement CinetPay
      const { data: paymentStatus, error: paymentError } = await checkCinetPayPaymentStatus({
        transactionId
      });

      if (paymentError || !paymentStatus) {
        toast.error('Impossible de vérifier le statut du paiement');
        return false;
      }

      // Vérifier si le paiement est accepté
      if (paymentStatus.code === '00' && paymentStatus.data.status === 'ACCEPTED') {
        // Mettre à niveau l'abonnement
        const { success, error } = await upgradeUserSubscription(
          user.id,
          planId,
          agencyId,
          'cinetpay'
        );

        if (error) {
          toast.error(`Erreur lors de la mise à niveau: ${error}`);
          return false;
        }

        if (success) {
          toast.success('Abonnement activé avec succès!');
          return true;
        }
      } else {
        toast.error('Le paiement n\'a pas été accepté');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      toast.error('Erreur lors du traitement du paiement');
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  return {
    processSubscriptionPayment,
    processingPayment
  };
};
