/**
 * Utilitaires pour la gestion des cycles de facturation
 */

export type BillingCycle = 'monthly' | 'quarterly' | 'semestriel' | 'yearly' | 'lifetime' | 'weekly';

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
    case 'semestrial':
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
 * Obtient le libellé français du cycle au féminin (pour "facturation")
 */
export const getBillingCycleFeminineLabel = (billingCycle: string): string => {
  switch (billingCycle) {
    case 'weekly':
      return 'hebdomadaire';
    case 'monthly':
      return 'mensuelle';
    case 'quarterly':
      return 'trimestrielle';
    case 'semestriel':
    case 'semestrial':
      return 'semestrielle';
    case 'yearly':
    case 'annual':
      return 'annuelle';
    case 'lifetime':
      return 'à vie';
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
    case 'semestrial':
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

/**
 * Calcule la date de fin d'abonnement selon le cycle de facturation
 */
export const calculateEndDate = (startDate: Date, billingCycle: string): Date => {
  const endDate = new Date(startDate);

  switch (billingCycle) {
    case 'weekly':
      endDate.setDate(startDate.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(startDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(startDate.getMonth() + 3);
      break;
    case 'semestriel':
    case 'semestrial':
      endDate.setMonth(startDate.getMonth() + 6);
      break;
    case 'yearly':
    case 'annual':
      endDate.setFullYear(startDate.getFullYear() + 1);
      break;
    case 'lifetime':
      // Pour un plan lifetime, on met la date à 100 ans dans le futur (pratiquement illimité)
      endDate.setFullYear(startDate.getFullYear() + 100);
      break;
    default:
      // Par défaut mensuel
      endDate.setMonth(startDate.getMonth() + 1);
  }

  return endDate;
}; 