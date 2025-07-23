/**
 * Utilitaires pour le formatage des contrats
 */

/**
 * Convertit le texte brut d'un contrat en HTML formaté
 * @param rawText - Le texte brut du contrat
 * @returns Le texte formaté en HTML
 */
export const formatContractText = (rawText: string): string => {
  if (!rawText) return '';

  let formattedText = rawText;

  // Nettoyer le texte d'abord
  formattedText = formattedText.trim();

  // Remplacer les doubles astérisques par des balises strong (gras)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Remplacer les astérisques simples par des balises em (italique) 
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Identifier et formater les titres (lignes qui commencent par des mots-clés en majuscules)
  const titlePatterns = [
    /^(CONTRAT DE [A-Z\s]+)/gm,
    /^(Entre\s*:?\s*)/gm,
    /^(Objet du contrat\s*:?\s*)/gm,
    /^(Durée du contrat\s*:?\s*)/gm,
    /^(Loyers et charges\s*:?\s*)/gm,
    /^(Obligations du Locataire\s*:?\s*)/gm,
    /^(Obligations de l'Agence\s*:?\s*)/gm,
    /^(Résiliation du contrat\s*:?\s*)/gm,
    /^(Litiges\s*:?\s*)/gm,
    /^(Accord\s*:?\s*)/gm,
    /^(Signatures\s*:?\s*)/gm
  ];

  titlePatterns.forEach(pattern => {
    formattedText = formattedText.replace(pattern, '<h2>$1</h2>');
  });

  // Formater les sous-titres (lignes avec des mots en gras suivis de deux points)
  formattedText = formattedText.replace(/^<strong>([^<]+)<\/strong>\s*:?\s*/gm, '<h3><strong>$1</strong></h3>');

  // Convertir les sauts de ligne doubles en paragraphes
  const paragraphs = formattedText.split(/\n\s*\n/);
  
  formattedText = paragraphs.map(paragraph => {
    paragraph = paragraph.trim();
    if (!paragraph) return '';
    
    // Si c'est déjà un titre (h2 ou h3), ne pas l'envelopper dans un paragraphe
    if (paragraph.startsWith('<h2>') || paragraph.startsWith('<h3>')) {
      return paragraph;
    }
    
    // Remplacer les sauts de ligne simples par des <br> dans les paragraphes
    paragraph = paragraph.replace(/\n/g, '<br>');
    
    return `<p>${paragraph}</p>`;
  }).join('\n\n');

  // Formater les listes à puces (lignes qui commencent par * ou •)
  formattedText = formattedText.replace(/<p>([^<]*?)(\* .+?)<\/p>/gs, (match, prefix, listContent) => {
    const items = listContent.split(/\n\* /).map(item => item.replace(/^\* /, ''));
    const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
    return `${prefix ? `<p>${prefix.trim()}</p>` : ''}<ul>${listItems}</ul>`;
  });

  // Nettoyer les espaces multiples et les sauts de ligne excessifs
  formattedText = formattedText.replace(/\s+/g, ' ');
  formattedText = formattedText.replace(/(<\/[^>]+>)\s+(<[^>]+>)/g, '$1\n$2');

  return formattedText;
};

/**
 * Convertit le HTML en texte brut pour l'affichage
 * @param htmlText - Le texte HTML
 * @returns Le texte brut
 */
export const stripHtmlTags = (htmlText: string): string => {
  if (!htmlText) return '';
  
  // Créer un élément temporaire pour décoder le HTML
  const temp = document.createElement('div');
  temp.innerHTML = htmlText;
  return temp.textContent || temp.innerText || '';
};

/**
 * Prévisualise le contenu d'un contrat (premiers caractères)
 * @param content - Le contenu du contrat
 * @param maxLength - Longueur maximale de la prévisualisation
 * @returns Le texte de prévisualisation
 */
export const previewContractContent = (content: string, maxLength: number = 150): string => {
  const plainText = stripHtmlTags(content);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
};

/**
 * Valide si le contenu d'un contrat est bien formaté
 * @param content - Le contenu à valider
 * @returns true si le contenu est valide
 */
export const validateContractContent = (content: string): boolean => {
  if (!content || content.trim().length === 0) return false;
  
  // Vérifier qu'il y a un minimum de contenu
  const plainText = stripHtmlTags(content);
  return plainText.length >= 50; // Au moins 50 caractères
};

/**
 * Extrait les parties d'un contrat à partir du contenu
 * @param content - Le contenu du contrat
 * @returns Un objet avec les parties identifiées
 */
export const extractPartiesFromContent = (content: string): Record<string, string> => {
  const parties: Record<string, string> = {};
  const plainText = stripHtmlTags(content);
  
  // Rechercher les patterns de parties
  const locataireMatch = plainText.match(/Locataire[:\s]*([^,\n]+)/i);
  if (locataireMatch) {
    parties.locataire = locataireMatch[1].trim();
  }
  
  const agenceMatch = plainText.match(/Agence[:\s]*([^,\n]+)/i);
  if (agenceMatch) {
    parties.agence = agenceMatch[1].trim();
  }
  
  const proprietaireMatch = plainText.match(/Propriétaire[:\s]*([^,\n]+)/i);
  if (proprietaireMatch) {
    parties.proprietaire = proprietaireMatch[1].trim();
  }
  
  return parties;
};

/**
 * Génère un titre automatique pour un contrat basé sur son contenu
 * @param content - Le contenu du contrat
 * @param type - Le type de contrat
 * @returns Un titre suggéré
 */
export const generateContractTitle = (content: string, type: string): string => {
  const plainText = stripHtmlTags(content);
  
  // Extraire des informations du contenu pour générer un titre
  const parties = extractPartiesFromContent(content);
  
  if (type === 'bail' && parties.locataire) {
    return `Contrat de location - ${parties.locataire}`;
  }
  
  if (type === 'vente' && parties.proprietaire) {
    return `Contrat de vente - ${parties.proprietaire}`;
  }
  
  // Titre par défaut basé sur le type
  const typeLabels: Record<string, string> = {
    bail: 'Contrat de location',
    vente: 'Contrat de vente',
    mandat: 'Mandat de gestion',
    prestation: 'Contrat de prestation',
    autre: 'Contrat'
  };
  
  return typeLabels[type] || 'Contrat';
}; 