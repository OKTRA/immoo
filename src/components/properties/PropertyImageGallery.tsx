import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getPropertyImages } from '@/services/property/propertyMedia';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Expand, X } from 'lucide-react';

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
    const processImages = async () => {
      setLoading(true);
      let finalImages: ImageData[] = [];

      // Priorité 1: Utiliser les images passées directement en props
      if (initialImages && initialImages.length > 0) {
        finalImages = initialImages.map((img, index) => ({
          id: img.id,
          url: img.image_url,
          description: img.description || (img.is_primary ? 'Image principale' : `Image ${index + 1}`)
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

  const MainImageDisplay = ({ inModal = false }) => (
    <div 
      className={`relative w-full ${inModal ? 'h-[80vh]' : height} bg-black ${inModal ? '' : 'rounded-lg overflow-hidden group'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image principale */}
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.description}
          className={`w-full h-full object-cover transition-transform duration-300 ${inModal ? 'object-contain' : 'group-hover:scale-105'}`}
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
          <div className={`absolute inset-0 flex items-center justify-between p-2 ${inModal ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
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
    <div className={`space-y-3 ${className}`}>
      {/* Image principale */}
      <MainImageDisplay />

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