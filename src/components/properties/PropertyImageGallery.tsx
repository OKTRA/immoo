import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getPropertyImages } from '@/services/property/propertyMedia';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Expand, X, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sanitizeImageUrl, isBlobUrl } from '@/utils/imageUrlUtils';

interface PropertyImageGalleryProps {
  propertyId: string;
  mainImageUrl?: string;
  images?: Array<{ id: string; image_url: string; is_primary: boolean; description?: string }>;
  height?: string;
  className?: string;
  showControls?: boolean;
  showThumbnails?: boolean;
  enableZoom?: boolean;
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
  showControls = true,
  showThumbnails = true,
  enableZoom = true
}: PropertyImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    const resolveImageUrl = async (rawUrl: string): Promise<string> => {
      if (!rawUrl) return rawUrl;
      
      // Check for blob URLs and validate them
      if (isBlobUrl(rawUrl)) {
        const sanitized = await sanitizeImageUrl(rawUrl);
        if (!sanitized) {
          console.warn('Invalid blob URL detected and removed from gallery:', rawUrl);
          return ''; // Return empty string for invalid blob URLs
        }
        return sanitized;
      }
      
      if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
      // Try properties bucket
      try {
        const { data } = supabase.storage.from('properties').getPublicUrl(rawUrl);
        if (data?.publicUrl) return data.publicUrl;
      } catch {}
      // Try legacy property-images bucket
      try {
        const { data } = supabase.storage.from('property-images').getPublicUrl(rawUrl);
        if (data?.publicUrl) return data.publicUrl;
      } catch {}
      return rawUrl;
    };

    const processImages = async () => {
      setLoading(true);
      let finalImages: ImageData[] = [];

      // Priorité 1: Utiliser les images passées directement en props
      if (initialImages && initialImages.length > 0) {
        // Support both object and string formats
        const anyImages: any[] = initialImages as any[];
        finalImages = await Promise.all(anyImages.map(async (img, index) => {
          if (typeof img === 'string') {
            const url = await resolveImageUrl(img);
            return {
              id: `str-${index}`,
              url,
              description: `Image ${index + 1}`,
            } as ImageData;
          }
          const url = await resolveImageUrl(img.image_url);
          return {
            id: img.id,
            url,
            description: img.description || (img.is_primary ? 'Image principale' : `Image ${index + 1}`)
          } as ImageData;
        }));
      } 
      // Priorité 2: Récupérer les images avec l'ID de la propriété
      else if (propertyId) {
        try {
          const { images: fetchedImages, error } = await getPropertyImages(propertyId);
          if (error) throw error;
          finalImages = await Promise.all(fetchedImages.map(async (img: any, index: number) => ({
            id: img.id,
            url: await resolveImageUrl(img.image_url),
            description: img.description || (img.is_primary ? 'Image principale' : `Image ${index + 1}`)
          })));
        } catch (err) {
          console.error('Échec de la récupération des images:', err);
          // Laisser finalImages vide en cas d'erreur
        }
      }

      // Fallback: Si aucune image n'a été trouvée, utiliser l'URL principale
      if (finalImages.length === 0 && mainImageUrl) {
        finalImages.push({
          id: 'fallback',
          url: await resolveImageUrl(mainImageUrl),
          description: 'Image principale'
        });
      }
      
      // Filter out images with empty URLs (invalid blob URLs)
      const validImages = finalImages.filter(img => img.url && img.url.trim() !== '');
      
      setImages(validImages);
      setLoading(false);
    };

    processImages();
  }, [propertyId, mainImageUrl, JSON.stringify(initialImages)]);

  const nextImage = () => {
    setCurrentIndex(current => (current === images.length - 1 ? 0 : current + 1));
  };

  const prevImage = () => {
    setCurrentIndex(current => (current === 0 ? images.length - 1 : current - 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };
  const removeImageAtIndex = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Adjust current index if needed
      if (updated.length === 0) {
        setCurrentIndex(0);
      } else if (index >= updated.length) {
        setCurrentIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const handleMainImageError = () => {
    // Remove the current failing image and try the next one
    removeImageAtIndex(currentIndex);
  };

  // Gestion du swipe sur mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${height} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center rounded-lg ${className} animate-pulse`}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Home className="h-12 w-12 text-gray-300 dark:text-gray-600 animate-pulse" />
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-lg"></div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`w-full ${height} bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="relative">
            <Home className="h-16 w-16 opacity-60" />
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Aucune image disponible</p>
            <p className="text-xs opacity-75">Image de la propriété</p>
          </div>
        </div>
      </div>
    );
  }

  const MainImageDisplay = ({ inModal = false }) => (
    <div 
      className={`relative w-full ${inModal ? 'h-[80vh]' : 'h-full'} bg-black ${inModal ? '' : 'rounded-lg overflow-hidden group'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image principale */}
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.description}
          className={`w-full h-full transition-transform duration-300 ${inModal ? 'object-contain' : 'object-cover group-hover:scale-105'}`}
          onError={handleMainImageError}
        />
        
        {/* Overlay gradient subtil */}
        {!inModal && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      {/* Navigation uniquement s'il y a plusieurs images */}
      {images.length > 1 && showControls && (
        <>
          {/* Boutons de navigation */}
          <div className={`absolute inset-0 flex items-center justify-between p-2 ${inModal ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity duration-200`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-0"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-0"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>

          {/* Compteur d'images */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}

      {/* Bouton zoom */}
      {enableZoom && !inModal && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-0"
            onClick={() => setIsZoomOpen(true)}
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bouton fermer en mode modal */}
      {inModal && (
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-0"
            onClick={() => setIsZoomOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {/* Image principale */}
      <div className={`w-full ${height} overflow-hidden`}>
        <MainImageDisplay />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && showThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-primary shadow-md' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => goToImage(index)}
            >
              <img
                src={image.url}
                alt={image.description}
                className="w-full h-full object-cover"
                onError={() => removeImageAtIndex(index)}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modal zoom */}
      {enableZoom && (
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
            <VisuallyHidden>
              <DialogTitle>Galerie d'images de la propriété</DialogTitle>
            </VisuallyHidden>
            <MainImageDisplay inModal={true} />
            
            {/* Thumbnails en modal */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`flex-shrink-0 relative w-12 h-12 rounded overflow-hidden border transition-all duration-200 ${
                      index === currentIndex 
                        ? 'border-white shadow-md' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    onClick={() => goToImage(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.description}
                      className="w-full h-full object-cover"
                      onError={() => removeImageAtIndex(index)}
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-white/20" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 