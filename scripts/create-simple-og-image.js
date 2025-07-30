import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Création d\'une OG Image simple pour IMMOO');
console.log('');

// Créer une image PNG simple avec notre logo IMMOO
const createSimpleOgImage = () => {
  // Créer un canvas HTML simple (1200x630)
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  
  // Fond dégradé IMMOO
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#1F2937'); // IMMOO Navy
  gradient.addColorStop(1, '#374151'); // Gris foncé
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Logo IMMOO (yeux simples)
  const logoX = 600;
  const logoY = 250;
  
  // Oeil gauche
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(logoX - 75, logoY, 50, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.stroke();
  
  // Pupille gauche
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(logoX - 75, logoY, 20, 0, 2 * Math.PI);
  ctx.fill();
  
  // Oeil droit
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(logoX + 75, logoY, 50, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Pupille droite
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(logoX + 75, logoY, 20, 0, 2 * Math.PI);
  ctx.fill();
  
  // Texte IMMOO
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IMMOO', logoX, logoY + 200);
  
  // Sous-titre
  ctx.fillStyle = '#D97706';
  ctx.font = '32px Arial, sans-serif';
  ctx.fillText('Plateforme Immobilière', logoX, logoY + 250);
  
  return canvas.toDataURL('image/png');
};

console.log('📋 Instructions pour créer l\'OG Image :');
console.log('');
console.log('1. Ouvrez votre navigateur et allez sur : http://localhost:8080/logo-showcase');
console.log('2. Faites défiler jusqu\'à la section "Image Open Graph (OG)"');
console.log('3. Cliquez sur "Télécharger OG Image (1200×630)"');
console.log('4. Le fichier sera automatiquement téléchargé');
console.log('');
console.log('🔧 Alternative rapide :');
console.log('1. Ouvrez le fichier SVG : file://' + path.join(__dirname, '..', 'public', 'og-image.svg').replace(/\\/g, '/'));
console.log('2. Faites un clic droit → "Enregistrer l\'image sous..." → og-image.png');
console.log('');
console.log('✅ L\'image remplacera automatiquement l\'ancienne image Lovable');
console.log('   dans tous les partages sur les réseaux sociaux !'); 