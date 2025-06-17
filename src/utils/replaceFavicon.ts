import { generateFaviconCanvas } from './generateFavicons';

export const replaceCurrentFavicon = () => {
  // Générer le nouveau favicon
  const canvas = generateFaviconCanvas(32);
  
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      
      // Supprimer l'ancien favicon s'il existe
      const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (existingFavicon) {
        existingFavicon.remove();
      }
      
      // Créer et ajouter le nouveau favicon
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = url;
      
      document.head.appendChild(newFavicon);
      
      console.log('Favicon IMMOO appliqué avec succès!');
    }
  }, 'image/png');
};