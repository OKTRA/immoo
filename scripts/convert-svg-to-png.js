import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Conversion SVG vers PNG pour OG Image');
console.log('');

// Lire le fichier SVG
const svgPath = path.join(__dirname, '..', 'public', 'og-image.svg');
const pngPath = path.join(__dirname, '..', 'public', 'og-image.png');

try {
  if (fs.existsSync(svgPath)) {
    console.log('✅ Fichier SVG trouvé :', svgPath);
    console.log('');
    console.log('📋 Instructions pour convertir en PNG :');
    console.log('');
    console.log('1. Ouvrez le fichier SVG dans votre navigateur :');
    console.log('   file://' + svgPath.replace(/\\/g, '/'));
    console.log('');
    console.log('2. Faites un clic droit sur l\'image et sélectionnez "Enregistrer l\'image sous..."');
    console.log('');
    console.log('3. Sauvegardez sous le nom "og-image.png" dans le dossier public/');
    console.log('');
    console.log('4. Ou utilisez un convertisseur en ligne :');
    console.log('   https://convertio.co/svg-png/');
    console.log('   https://cloudconvert.com/svg-to-png');
    console.log('');
    console.log('🎯 Le fichier PNG sera automatiquement utilisé pour :');
    console.log('   • Facebook, Twitter, LinkedIn');
    console.log('   • WhatsApp, Telegram');
    console.log('   • Tous les réseaux sociaux');
  } else {
    console.log('❌ Fichier SVG non trouvé :', svgPath);
  }
} catch (error) {
  console.log('❌ Erreur lors de la lecture du fichier SVG :', error.message);
} 