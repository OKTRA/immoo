
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getPropertyImages } from '@/services/property/propertyMedia';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PropertyImagesCarouselProps {
  propertyId: string;
  mainImageUrl?: string;
  height?: string;
}

export default function PropertyImagesCarousel({ 
  propertyId, 
  mainImageUrl, 
  height = "h-96" 
}: PropertyImagesCarouselProps) {
  const [images, setImages] = useState<{id: string, url: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      
      try {
        const { images, error } = await getPropertyImages(propertyId);
        
        if (error) {
          setError(error);
          return;
        }
        
        // Transformer les données
        const allImages = images.map(img => ({
          id: img.id,
          url: img.image_url
        }));
        
        // Si on a un mainImageUrl et qu'il n'est pas dans les images, l'ajouter
        if (mainImageUrl && !allImages.some(img => img.url === mainImageUrl)) {
          allImages.unshift({ id: 'main', url: mainImageUrl });
        }
        
        setImages(allImages);
      } catch (err) {
        console.error('Failed to fetch property images:', err);
        setError('Impossible de charger les images');
      } finally {
        setLoading(false);
      }
    };
    
    if (propertyId) {
      fetchImages();
    }
  }, [propertyId, mainImageUrl]);

  const goToNextSlide = () => {
    setCurrentIndex(current => (current === images.length - 1 ? 0 : current + 1));
  };

  const goToPrevSlide = () => {
    setCurrentIndex(current => (current === 0 ? images.length - 1 : current - 1));
  };

  if (loading) {
    return (
      <div className={`w-full ${height} bg-muted flex items-center justify-center rounded-lg animate-pulse`}>
        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className={`w-full ${height} bg-muted flex flex-col items-center justify-center rounded-lg`}>
        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground text-center px-2">
          {error || "Aucune image disponible"}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} rounded-lg overflow-hidden`}>
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={image.url}
            alt={`Vue de la propriété ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
      
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-2 transform -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
            onClick={goToPrevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 transform -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
            onClick={goToNextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex items-center justify-center gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
