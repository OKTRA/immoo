export const generateFaviconCanvas = (size: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  // Fond blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  
  // Calculer les proportions pour les yeux
  const eyeRadius = size * 0.25; // 25% de la taille
  const eyeSpacing = size * 0.15; // Espacement entre les yeux
  const centerX = size / 2;
  const centerY = size / 2;
  
  const leftEyeX = centerX - eyeSpacing;
  const rightEyeX = centerX + eyeSpacing;
  
  // Contour noir des yeux
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.fillStyle = '#FFFFFF';
  
  // Oeil gauche - contour
  ctx.beginPath();
  ctx.arc(leftEyeX, centerY, eyeRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Oeil droit - contour
  ctx.beginPath();
  ctx.arc(rightEyeX, centerY, eyeRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Pupilles dorées
  ctx.fillStyle = '#D97706'; // Couleur or IMMOO
  const pupilRadius = eyeRadius * 0.4;
  
  // Pupille gauche
  ctx.beginPath();
  ctx.arc(leftEyeX, centerY, pupilRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Pupille droite
  ctx.beginPath();
  ctx.arc(rightEyeX, centerY, pupilRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Reflets sur les pupilles pour plus de réalisme
  ctx.fillStyle = '#FED7AA'; // Or plus clair
  const reflectRadius = pupilRadius * 0.3;
  const reflectOffsetX = pupilRadius * 0.2;
  const reflectOffsetY = -pupilRadius * 0.2;
  
  // Reflet pupille gauche
  ctx.beginPath();
  ctx.arc(leftEyeX + reflectOffsetX, centerY + reflectOffsetY, reflectRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Reflet pupille droite
  ctx.beginPath();
  ctx.arc(rightEyeX + reflectOffsetX, centerY + reflectOffsetY, reflectRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas;
};

export const downloadFavicon = (size: number, format: 'png' | 'ico' = 'png') => {
  const canvas = generateFaviconCanvas(size);
  
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favicon-${size}x${size}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, `image/${format}`);
};

export const generateAllFavicons = () => {
  const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
  
  sizes.forEach(size => {
    setTimeout(() => {
      downloadFavicon(size, 'png');
    }, size * 10); // Délai pour éviter de surcharger le navigateur
  });
  
  // Générer aussi les ICO
  [16, 32, 48].forEach(size => {
    setTimeout(() => {
      downloadFavicon(size, 'ico');
    }, (size + 1000) * 10);
  });
};

// Générer le contenu du manifest.json pour PWA
export const generateWebManifest = () => {
  const manifest = {
    name: "IMMOO - Plateforme Immobilière",
    short_name: "IMMOO",
    description: "La première plateforme immobilière premium intégrée",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#D97706",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/favicon-180x180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "apple-touch-icon"
      }
    ]
  };
  
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'manifest.json';
  a.click();
  URL.revokeObjectURL(url);
}; 