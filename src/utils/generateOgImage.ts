export const generateOgImageCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200; // Taille standard pour og:image
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  // Fond dégradé IMMOO
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#1F2937'); // IMMOO Navy
  gradient.addColorStop(1, '#374151'); // Gris foncé
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Ajouter un motif subtil
  ctx.fillStyle = 'rgba(217, 119, 6, 0.1)'; // Or IMMOO avec transparence
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(200 + i * 100, 150 + i * 30, 50, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // Logo IMMOO (yeux)
  const logoSize = 200;
  const logoX = 600;
  const logoY = 250;
  
  // Calculer les proportions pour les yeux
  const eyeRadius = logoSize * 0.25;
  const eyeSpacing = logoSize * 0.15;
  const leftEyeX = logoX - eyeSpacing;
  const rightEyeX = logoX + eyeSpacing;
  
  // Contour blanc des yeux
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.fillStyle = '#FFFFFF';
  
  // Oeil gauche - contour
  ctx.beginPath();
  ctx.arc(leftEyeX, logoY, eyeRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Oeil droit - contour
  ctx.beginPath();
  ctx.arc(rightEyeX, logoY, eyeRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Pupilles dorées
  ctx.fillStyle = '#D97706'; // Couleur or IMMOO
  const pupilRadius = eyeRadius * 0.4;
  
  // Pupille gauche
  ctx.beginPath();
  ctx.arc(leftEyeX, logoY, pupilRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Pupille droite
  ctx.beginPath();
  ctx.arc(rightEyeX, logoY, pupilRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Reflets sur les pupilles
  ctx.fillStyle = '#FED7AA';
  const reflectRadius = pupilRadius * 0.3;
  const reflectOffsetX = pupilRadius * 0.2;
  const reflectOffsetY = -pupilRadius * 0.2;
  
  // Reflet pupille gauche
  ctx.beginPath();
  ctx.arc(leftEyeX + reflectOffsetX, logoY + reflectOffsetY, reflectRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Reflet pupille droite
  ctx.beginPath();
  ctx.arc(rightEyeX + reflectOffsetX, logoY + reflectOffsetY, reflectRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Texte "IMMOO"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IMMOO', logoX, logoY + 200);
  
  // Sous-titre
  ctx.fillStyle = '#D97706';
  ctx.font = '32px Inter, sans-serif';
  ctx.fillText('Plateforme Immobilière', logoX, logoY + 250);
  
  // Tagline
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '24px Inter, sans-serif';
  ctx.fillText('Votre partenaire de confiance pour l\'immobilier', logoX, logoY + 290);
  
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