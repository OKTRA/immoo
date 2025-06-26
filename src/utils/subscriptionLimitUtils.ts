/**
 * Utilitaires pour la gestion des limites d'abonnement
 */

/**
 * Formate l'affichage d'une limite (nombre ou "Illimité")
 */
export const formatLimit = (limit: number): string => {
  return limit === -1 ? 'Illimité' : limit.toString();
};

/**
 * Vérifie si une limite est illimitée
 */
export const isUnlimitedLimit = (limit: number): boolean => {
  return limit === -1;
};

/**
 * Convertit une valeur de formulaire en limite (-1 pour illimité)
 */
export const convertToLimit = (value: number | string, unlimited: boolean): number => {
  if (unlimited) return -1;
  return typeof value === 'string' ? parseInt(value) || 1 : value || 1;
};

/**
 * Obtient la valeur d'affichage pour un champ de formulaire
 */
export const getFormDisplayValue = (limit: number): string => {
  return limit === -1 ? '' : limit.toString();
};

/**
 * Calcule le pourcentage d'utilisation d'une ressource
 */
export const calculateUsagePercentage = (current: number, max: number): number => {
  if (max === -1) return 0; // Illimité = 0% d'utilisation
  if (max === 0) return 100;
  return Math.round((current / max) * 100);
};

/**
 * Vérifie si l'utilisateur peut encore utiliser une ressource
 */
export const canUseResource = (current: number, max: number): boolean => {
  if (max === -1) return true; // Illimité
  return current < max;
};

/**
 * Obtient le texte d'état d'une limite
 */
export const getLimitStatusText = (current: number, max: number): string => {
  if (max === -1) {
    return `${current} (illimité)`;
  }
  return `${current} / ${max}`;
};

/**
 * Obtient la couleur d'état d'une limite pour l'UI
 */
export const getLimitStatusColor = (current: number, max: number): 'green' | 'yellow' | 'red' => {
  if (max === -1) return 'green'; // Illimité = toujours vert
  
  const percentage = calculateUsagePercentage(current, max);
  
  if (percentage >= 100) return 'red';
  if (percentage >= 80) return 'yellow';
  return 'green';
}; 