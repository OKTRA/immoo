import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property } from "@/assets/types";
import { Upload, X, Image as ImageIcon, Star, StarIcon, Plus, Trash2 } from "lucide-react";
import { useMobileToast } from '@/hooks/useMobileToast';
import { uploadPropertyImage } from "@/services/property/propertyMediaService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/useTranslation";

interface PropertyMediaFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
  propertyId?: string;
}

interface ImageItem {
  id: string;
  url: string;
  file: File | null;
  isPrimary: boolean;
  uploading: boolean;
  description: string;
}

export default function PropertyMediaForm({ initialData, onChange, onNext, onBack, propertyId }: PropertyMediaFormProps) {
  const { t } = useTranslation();
  const mobileToast = useMobileToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [virtualTourUrl, setVirtualTourUrl] = useState(initialData.virtualTourUrl || "");

  // Initialize existing images when editing
  useEffect(() => {
    const existingImages: ImageItem[] = [];
    
    // Add main image if exists
    if (initialData.imageUrl) {
      existingImages.push({
        id: 'main-image',
        url: initialData.imageUrl,
        file: null,
        isPrimary: true,
        uploading: false,
        description: ''
      });
    }
    
    // Add additional images if exist
    if (initialData.additionalImages && initialData.additionalImages.length > 0) {
      initialData.additionalImages.forEach((img, index) => {
        existingImages.push({
          id: `additional-${index}`,
          url: img.url,
          file: null,
          isPrimary: img.isPrimary || false,
          uploading: false,
          description: img.description || ''
        });
      });
    }
    
    setImages(existingImages);
  }, [initialData.imageUrl, initialData.additionalImages]);

  useEffect(() => {
    // Find primary image
    const primaryImage = images.find(img => img.isPrimary);
    
    onChange({
      imageUrl: primaryImage?.url || "",
      virtualTourUrl,
      additionalImages: images
        .filter(img => !img.isPrimary && !img.file) // Only non-primary, uploaded images
        .map(img => ({
          url: img.url,
          isPrimary: img.isPrimary,
          description: img.description
        }))
    });
  }, [images, virtualTourUrl, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Check if we're not exceeding the limit (10 images total)
      if (images.length + filesArray.length > 10) {
        toast.error(t('agencyDashboard.pages.createProperty.maxImagesReached'));
        return;
      }

      // Create new image items
      const newImages: ImageItem[] = filesArray.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        url: URL.createObjectURL(file),
        file,
        isPrimary: images.length === 0, // First image becomes primary if no images exist
        uploading: false,
        description: ""
      }));

      // Add new images to state
      setImages(prev => {
        const updated = [...prev, ...newImages];
        
        // If this is the first image, make it primary
        if (prev.length === 0 && newImages.length > 0) {
          updated[0].isPrimary = true;
        }
        
        return updated;
      });

      // Upload images immediately
      newImages.forEach((img, index) => {
        const globalIndex = images.length + index;
        handleUploadImage(globalIndex);
      });
    }
  };

  const handleUploadImage = async (index: number) => {
    const image = images[index];
    if (!image.file) return;
    
    // Update uploading status
    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], uploading: true };
      return updated;
    });
    
    try {
      const tempId = propertyId || "temp-" + Date.now();
      const { imageUrl, error } = await uploadPropertyImage(tempId, image.file!, image.isPrimary, image.description);
      
      if (error) throw new Error(error);
      
      // Update URL and uploading status
      setImages(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          url: imageUrl, 
          uploading: false,
          file: null // File uploaded, can be cleared
        };
        return updated;
      });
      
      // Toast de téléchargement d'image désactivé sur mobile (non essentiel)
      mobileToast.success(t('agencyDashboard.pages.createProperty.imageUploadedSuccessfully'));
    } catch (error: any) {
      mobileToast.error(`${t('agencyDashboard.pages.createProperty.uploadError')}: ${error.message}`);
      
      // Reset uploading status
      setImages(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], uploading: false };
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      
      // If we removed the primary image and there are other images, make the first one primary
      if (imageToRemove.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      
      return updated;
    });
    
    // Toast de suppression d'image désactivé sur mobile (non essentiel)
    mobileToast.success(t('agencyDashboard.pages.createProperty.imageRemoved'));
  };

  const setImageAsPrimary = (index: number) => {
    // If image is already primary, do nothing
    if (images[index].isPrimary) return;
    
    setImages(prev => {
      return prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
    });
    
    // Toast de mise à jour d'image principale désactivé sur mobile (non essentiel)
    mobileToast.success(t('agencyDashboard.pages.createProperty.primaryImageUpdated'));
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description };
      return updated;
    });
  };

  const handleVirtualTourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVirtualTourUrl(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">{t('agencyDashboard.pages.createProperty.propertyPhotos')}</Label>
          <span className="text-sm text-muted-foreground">
            {images.length}/10 {t('agencyDashboard.pages.createProperty.images')}
          </span>
        </div>
        
        {/* Upload Area */}
        <div className="mb-4">
          <Input
            id="propertyImages"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="propertyImages"
            className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <Upload className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm text-blue-600 font-medium">
              {t('agencyDashboard.pages.createProperty.clickOrDragToSelectPhotos')}
            </span>
            <span className="text-xs text-blue-500 mt-1">
              {t('agencyDashboard.pages.createProperty.recommendedFormat')}
            </span>
          </label>
        </div>
        
        {/* Images Grid */}
        {images.length > 0 && (
          <ScrollArea className="h-96 border rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group border rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* Image */}
                  <div className="relative h-48 w-full">
                    <img 
                      src={image.url} 
                      alt={`${t('agencyDashboard.pages.createProperty.propertyImage')} ${index + 1}`} 
                      className="h-full w-full object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <StarIcon className="h-3 w-3 mr-1" />
                        {t('agencyDashboard.pages.createProperty.primary')}
                      </div>
                    )}
                    
                    {/* Uploading Overlay */}
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">{t('agencyDashboard.pages.createProperty.uploading')}</div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => setImageAsPrimary(index)}
                          title={t('agencyDashboard.pages.createProperty.setAsPrimary')}
                          disabled={image.isPrimary}
                        >
                          <Star className="h-4 w-4 text-white" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          onClick={() => removeImage(index)}
                          title={t('agencyDashboard.pages.createProperty.removeImage')}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                      
                      {/* Description Input */}
                      <div className="space-y-2">
                        <Input
                          value={image.description}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          placeholder={t('agencyDashboard.pages.createProperty.imageDescription')}
                          className="text-xs bg-white/90 border-white/20 placeholder:text-gray-500"
                        />
                        {image.file && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="w-full text-xs"
                            onClick={() => handleUploadImage(index)}
                            disabled={image.uploading}
                          >
                            {image.uploading ? t('agencyDashboard.pages.createProperty.uploading') : t('agencyDashboard.pages.createProperty.upload')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t('agencyDashboard.pages.createProperty.image')} {index + 1}
                      </span>
                      {image.isPrimary && (
                        <span className="text-xs text-yellow-600 font-medium">
                          {t('agencyDashboard.pages.createProperty.primary')}
                        </span>
                      )}
                    </div>
                    {image.description && (
                      <p className="text-xs text-gray-600 truncate">
                        {image.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <p className="text-xs text-muted-foreground">
          {t('agencyDashboard.pages.createProperty.photosDescription')}
        </p>
      </div>

      {/* Virtual Tour URL */}
      <div className="space-y-2">
        <Label htmlFor="virtualTourUrl">{t('agencyDashboard.pages.createProperty.virtualTourUrl')}</Label>
        <Input
          id="virtualTourUrl"
          name="virtualTourUrl"
          type="url"
          placeholder="https://exemple.com/visite-virtuelle"
          value={virtualTourUrl}
          onChange={handleVirtualTourChange}
        />
        <p className="text-xs text-muted-foreground">
          {t('agencyDashboard.pages.createProperty.virtualTourDescription')}
        </p>
      </div>

      {/* Navigation Buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              {t('agencyDashboard.pages.createProperty.back')}
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              {t('agencyDashboard.pages.createProperty.next')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
