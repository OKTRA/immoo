/**
 * Utilitaires pour la gestion des URLs
 */

/**
 * Formate une URL pour s'assurer qu'elle a un protocole
 * @param url - L'URL à formater
 * @returns L'URL avec le protocole https:// si nécessaire
 */
export function formatWebsiteUrl(url: string): string {
  if (!url) return '';
  
  // Si l'URL commence déjà par http:// ou https://, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Sinon, ajouter https:// par défaut
  return `https://${url}`;
}

/**
 * Vérifie si une URL est valide
 * @param url - L'URL à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(formatWebsiteUrl(url));
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrait le domaine d'une URL
 * @param url - L'URL dont extraire le domaine
 * @returns Le domaine ou l'URL originale si extraction impossible
 */
export function extractDomain(url: string): string {
  try {
    const formattedUrl = formatWebsiteUrl(url);
    const urlObj = new URL(formattedUrl);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
