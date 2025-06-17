import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { PropertyImageService } from '@/services/property/propertyImageService';
import { toast } from '@/hooks/use-toast';

interface PropertyImageUploadProps {
  propertyId: string;
  currentImageUrl?: string;
  onImageUploaded?: (imageUrl: string) => void;
  className?: string;
}

export default function PropertyImageUpload({
  propertyId,
  currentImageUrl,
  onImageUploaded,
  className = ''
}: PropertyImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur", 
        description: "L'image ne doit pas dépasser 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setIsUploading(true);
    try {
      const imagePath = await PropertyImageService.uploadImage(file, propertyId);
      
      if (imagePath) {
        const imageUrl = PropertyImageService.getImageUrl(imagePath);
        onImageUploaded?.(imageUrl);
        
        toast({
          title: "Succès",
          description: "Image téléchargée avec succès !",
          variant: "default"
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Échec du téléchargement de l'image.",
        variant: "destructive"
      });
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-48 w-full">
              <img
                src={preview}
                alt="Aperçu de la propriété"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={triggerFileSelect}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Changer
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors"
          onClick={triggerFileSelect}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ajouter une image
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Glissez et déposez une image ou cliquez pour parcourir
            </p>
            <Button disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Téléchargement...' : 'Sélectionner une image'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="text-xs text-gray-500">
        Formats acceptés : JPEG, PNG, WebP, GIF • Taille max : 10MB
      </div>
    </div>
  );
} 