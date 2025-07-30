export const generateOgImageCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200; // Taille standard pour og:image
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  // Fond dégradé (bleu clair vers blanc)
  const gradient = ctx.createLinearGradient(0, 0, 0, 630);
  gradient.addColorStop(0, '#E0F2FE'); // Bleu très clair
  gradient.addColorStop(1, '#FFFFFF'); // Blanc
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Header
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1200, 80);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 1200, 80);
  
  // Logo IMMOO dans le header
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('IMM', 60, 50);
  
  // Icônes des yeux
  ctx.beginPath();
  ctx.arc(140, 35, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(160, 35, 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Boutons du header
  // Espace Agence
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(860, 20, 120, 40);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(860, 20, 120, 40);
  ctx.fillStyle = '#64748B';
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('Espace Agence', 920, 45);
  
  // IMMOO Agency
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(1000, 20, 120, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('IMMOO Agency', 1060, 45);
  
  // EN
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(1140, 20, 60, 40);
  ctx.strokeStyle = '#E2E8F0';
  ctx.strokeRect(1140, 20, 60, 40);
  ctx.fillStyle = '#64748B';
  ctx.fillText('EN', 1170, 45);
  
  // Titre principal
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Trouve ton futur chez toi', 600, 180);
  
  // Carte de recherche principale
  const cardX = 100;
  const cardY = 220;
  const cardWidth = 1000;
  const cardHeight = 280;
  
  // Ombre de la carte
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  
  // Fond de la carte
  const cardGradient = ctx.createLinearGradient(0, cardY, 0, cardY + cardHeight);
  cardGradient.addColorStop(0, '#FFFFFF');
  cardGradient.addColorStop(1, '#F8FAFC');
  ctx.fillStyle = cardGradient;
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
  
  // Bordure de la carte
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
  
  // Onglets
  // Propriétés (actif)
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(cardX + 40, cardY + 30, 120, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('Propriétés', cardX + 100, cardY + 55);
  
  // Agences (inactif)
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(cardX + 180, cardY + 30, 120, 40);
  ctx.fillStyle = '#64748B';
  ctx.fillText('Agences', cardX + 240, cardY + 55);
  
  // Barre de recherche principale
  const searchX = cardX + 40;
  const searchY = cardY + 100;
  const searchWidth = 800;
  const searchHeight = 60;
  
  // Fond de la barre de recherche
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(searchX, searchY, searchWidth, searchHeight);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(searchX, searchY, searchWidth, searchHeight);
  
  // Icône de recherche
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(searchX + 30, searchY + 30, 8, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(searchX + 35, searchY + 35);
  ctx.lineTo(searchX + 40, searchY + 40);
  ctx.stroke();
  
  // Texte de placeholder
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Rechercher une propriété ou une agence...', searchX + 60, searchY + 35);
  
  // Bouton Rechercher
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(searchX + 820, searchY, 120, searchHeight);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Rechercher', searchX + 880, searchY + 35);
  
  // Filtres
  const filtersY = cardY + 180;
  
  // Localisation
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(searchX, filtersY, 300, 50);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(searchX, filtersY, 300, 50);
  
  // Icône localisation (point rose)
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.arc(searchX + 25, filtersY + 25, 6, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#64748B';
  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Localisation', searchX + 45, filtersY + 30);
  
  // Type
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(searchX + 320, filtersY, 300, 50);
  ctx.strokeRect(searchX + 320, filtersY, 300, 50);
  
  // Icône maison
  ctx.fillStyle = '#64748B';
  ctx.fillRect(searchX + 335, filtersY + 15, 12, 8);
  ctx.fillText('Type', searchX + 355, filtersY + 30);
  
  // Budget
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(searchX + 640, filtersY, 300, 50);
  ctx.strokeRect(searchX + 640, filtersY, 300, 50);
  
  // Icône budget (cercle)
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.arc(searchX + 665, filtersY + 25, 8, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillText('Budget', searchX + 685, filtersY + 30);
  
  // Tagline en bas
  ctx.fillStyle = '#64748B';
  ctx.font = '18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Votre plateforme immobilière de confiance', 600, 580);
  
  return canvas;
};

export const downloadOgImage = () => {
  const canvas = generateOgImageCanvas();
  
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'og-image.png';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

export const generateOgImageDataUrl = (): string => {
  const canvas = generateOgImageCanvas();
  return canvas.toDataURL('image/png');
}; 