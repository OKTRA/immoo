import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getPropertyImages } from '@/services/property/propertyMedia';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PropertyImageGalleryProps {
  propertyId: string;
  mainImageUrl?: string;
  images?: Array<{ id: string; image_url: string; is_primary: boolean }>;
  height?: string;
  className?: string;
  showControls?: boolean;
}

interface ImageData {
  id: string;
  url: string;
  description?: string;
}

export default function PropertyImageGallery({ 
  propertyId, 
  mainImageUrl, 
  images: initialImages,
  height = "h-64",
  className = "",
  showControls = true
}: PropertyImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processImages = async () => {
      setLoading(true);
      let finalImages: ImageData[] = [];

      // Priorité 1: Utiliser les images passées directement en props
      if (initialImages && initialImages.length > 0) {
        finalImages = initialImages.map((img, index) => ({
          id: img.id,
          url: img.image_url,
          description: `Image ${index + 1}`
        }));
      } 
      // Priorité 2: Récupérer les images avec l'ID de la propriété
      else if (propertyId) {
        try {
          const { images: fetchedImages, error } = await getPropertyImages(propertyId);
          if (error) throw error;
          finalImages = fetchedImages.map((img, index) => ({
            id: img.id,
            url: img.image_url,
            description: img.description || (img.is_primary ? 'Image principale' : `Image ${index + 1}`)
          }));
        } catch (err) {
          console.error('Échec de la récupération des images:', err);
          // Laisser finalImages vide en cas d'erreur
        }
      }

      // Fallback: Si aucune image n'a été trouvée, utiliser l'URL principale
      if (finalImages.length === 0 && mainImageUrl) {
        finalImages.push({
          id: 'fallback',
          url: mainImageUrl,
          description: 'Image principale'
        });
      }
      
      setImages(finalImages);
      setLoading(false);
    };

    processImages();
  }, [propertyId, mainImageUrl, JSON.stringify(initialImages)]); // Utiliser JSON.stringify pour stabiliser la dépendance

  const nextImage = () => {
    setCurrentIndex(current => (current === images.length - 1 ? 0 : current + 1));
  };

  const prevImage = () => {
    setCurrentIndex(current => (current === 0 ? images.length - 1 : current - 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={`w-full ${height} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 text-gray-400 animate-pulse" />
          <div className="h-2 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`w-full ${height} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm font-medium">Aucune image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} rounded-lg overflow-hidden group bg-black ${className}`}>
      {/* Image principale */}
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.description}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay gradient subtil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Navigation uniquement s'il y a plusieurs images */}
      {images.length > 1 && showControls && (
        <>
          {/* Boutons de navigation */}
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'w-6 bg-white' 
                    : 'w-1.5 bg-white/60 hover:bg-white/80'
                }`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>

          {/* Compteur d'images */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
} 