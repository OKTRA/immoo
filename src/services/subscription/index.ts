export * from './mutations';
export * from './queries';
export * from './types';
export * from './manualSubscriptionService';

/**
 * Utilitaires pour la gestion des abonnements
 */

/**
 * Calcule la date de fin d'abonnement selon le cycle de facturation
 */
export const calculateSubscriptionEndDate = (
  startDate: Date | string,
  billingCycle: 'monthly' | 'yearly' | 'weekly'
): Date => {
  const start = new Date(startDate);
  const endDate = new Date(start);

  switch (billingCycle) {
    case 'weekly':
      endDate.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(start.getMonth() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(start.getFullYear() + 1);
      break;
    default:
      // Par défaut mensuel
      endDate.setMonth(start.getMonth() + 1);
  }

  return endDate;
};

/**
 * Vérifie si un abonnement est expiré
 */
export const isSubscriptionExpired = (endDate: Date | string | null): boolean => {
  if (!endDate) return false; // Pas de date de fin = pas d'expiration (plan gratuit)
  return new Date(endDate) <= new Date();
};

/**
 * Calcule le nombre de jours restants dans un abonnement
 */
export const getDaysUntilExpiration = (endDate: Date | string | null): number => {
  if (!endDate) return Infinity; // Pas de date de fin = infini
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Détermine le type d'opération d'abonnement selon l'état actuel
 */
export const determineSubscriptionOperationType = (
  currentSubscription: any | null
): 'new_subscription' | 'upgrade' | 'renewal' => {
  if (!currentSubscription) {
    return 'new_subscription';
  }

  const isExpired = isSubscriptionExpired(currentSubscription.end_date);
  
  if (isExpired) {
    return 'renewal';
  }

  return 'upgrade';
};

/**
 * Logique centralisée pour les messages d'abonnement
 */
export const getSubscriptionMessages = {
  upgrade: (planName: string) => ({
    success: `Upgrade vers ${planName} effectué avec succès. Votre période actuelle est conservée.`,
    description: `Upgrade vers le plan ${planName} (période active conservée)`
  }),
  
  newSubscription: (planName: string, endDate: Date) => ({
    success: `Abonnement ${planName} activé avec succès jusqu'au ${endDate.toLocaleDateString()}.`,
    description: `Nouvelle activation du plan ${planName}`
  }),
  
  renewal: (planName: string, endDate: Date) => ({
    success: `Renouvellement vers ${planName} effectué avec succès jusqu'au ${endDate.toLocaleDateString()}.`,
    description: `Renouvellement vers le plan ${planName}`
  })
};
