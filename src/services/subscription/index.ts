export * from './mutations';
export * from './queries';
export * from './types';
export * from './manualSubscriptionService';
import { supabase } from '@/lib/supabase';

/**
 * Utilitaires pour la gestion des abonnements
 */

/**
 * Calcule la date de fin d'abonnement selon le cycle de facturation
 */
export const calculateSubscriptionEndDate = (
  startDate: Date | string,
  billingCycle: 'monthly' | 'quarterly' | 'semestriel' | 'yearly' | 'lifetime' | 'weekly'
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
    case 'quarterly':
      endDate.setMonth(start.getMonth() + 3);
      break;
    case 'semestriel':
      endDate.setMonth(start.getMonth() + 6);
      break;
    case 'yearly':
      endDate.setFullYear(start.getFullYear() + 1);
      break;
    case 'lifetime':
      // Pour un plan lifetime, on met la date à 100 ans dans le futur (pratiquement illimité)
      endDate.setFullYear(start.getFullYear() + 100);
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
export const isSubscriptionExpired = (endDate: string | Date | null): boolean => {
  if (!endDate) return false;
  const today = new Date();
  const expiration = new Date(endDate);
  return today > expiration;
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

/**
 * Obtient le libellé français du cycle de facturation
 */
export const getBillingCycleLabel = (billingCycle: string): string => {
  switch (billingCycle) {
    case 'weekly':
      return 'Hebdomadaire';
    case 'monthly':
      return 'Mensuel';
    case 'quarterly':
      return 'Trimestriel';
    case 'semestriel':
      return 'Semestriel';
    case 'yearly':
    case 'annual':
      return 'Annuel';
    case 'lifetime':
      return 'À vie';
    default:
      return billingCycle;
  }
};

/**
 * Obtient le suffixe d'affichage pour le prix selon le cycle
 */
export const getBillingCycleSuffix = (billingCycle: string): string => {
  switch (billingCycle) {
    case 'weekly':
      return '/semaine';
    case 'monthly':
      return '/mois';
    case 'quarterly':
      return '/trimestre';
    case 'semestriel':
      return '/6 mois';
    case 'yearly':
    case 'annual':
      return '/an';
    case 'lifetime':
      return ' (à vie)';
    default:
      return '';
  }
};
