import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property } from "@/assets/types";
import { Upload, X, Image as ImageIcon, Star, StarIcon, Plus, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadPropertyImage } from "@/services/property/propertyMediaService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PropertyMediaFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
  propertyId?: string;
}

export default function PropertyMediaForm({ initialData, onChange, onNext, onBack, propertyId }: PropertyMediaFormProps) {
  const [formData, setFormData] = useState({
    imageUrl: initialData.imageUrl || "",
    virtualTourUrl: initialData.virtualTourUrl || "",
  });
  const [uploading, setUploading] = useState(false);
  
  // Nouvel état pour gérer plusieurs images
  const [additionalImages, setAdditionalImages] = useState<Array<{
    id: string,
    url: string, 
    file: File | null,
    isPrimary: boolean,
    uploading: boolean,
    description: string
  }>>([]);
  
  // Pour suivre si l'image principale a changé
  const [mainImageChanged, setMainImageChanged] = useState(false);

  // Initialize existing additional images when editing
  useEffect(() => {
    if (initialData.additionalImages && initialData.additionalImages.length > 0) {
      const existingImages = initialData.additionalImages.map((img, index) => ({
        id: `existing-${index}`,
        url: img.url,
        file: null,
        isPrimary: img.isPrimary,
        uploading: false,
        description: img.description || ''
      }));
      setAdditionalImages(existingImages);
    }
  }, [initialData.additionalImages]);

  useEffect(() => {
    onChange({
      imageUrl: formData.imageUrl,
      virtualTourUrl: formData.virtualTourUrl,
      // Ajouter les images additionnelles aux données du formulaire
      additionalImages: additionalImages.filter(img => !img.file).map(img => ({
        url: img.url,
        isPrimary: img.isPrimary,
        description: img.description
      }))
    });
  }, [formData.imageUrl, formData.virtualTourUrl, additionalImages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Create a preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl }));
      
      // Upload immediately
      handleUploadMainImage(file);
    }
  };
  
  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);

      // Préparer les nouvelles images à ajouter dans le state
      const newImages = filesArray.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        url: URL.createObjectURL(file),
        file,
        isPrimary: false,
        uploading: true, // On démarre l'upload immédiatement
        description: ""
      }));

      // Index de départ des nouvelles images dans le tableau final
      const startIndex = additionalImages.length;

      // 1) Ajouter les images au state pour affichage immédiat du preview
      setAdditionalImages(prev => [...prev, ...newImages]);

      // 2) Lancer l'upload pour chaque nouveau fichier
      newImages.forEach(async (img, idx) => {
        const globalIndex = startIndex + idx; // position réelle dans le tableau après ajout
        try {
          const tempId = propertyId || "temp-" + Date.now();
          const { imageUrl, error } = await uploadPropertyImage(tempId, img.file!, false, img.description);
          if (error) throw new Error(error);

          // Mettre à jour l'URL et l'état uploading
          setAdditionalImages(prev => {
            const updated = [...prev];
            updated[globalIndex] = {
              ...updated[globalIndex],
              url: imageUrl,
              uploading: false,
              file: null // libérer le fichier
            };
            return updated;
          });
        } catch (err: any) {
          toast.error(`Erreur lors du téléchargement: ${err.message}`);
          // Échec -> réinitialiser uploading
          setAdditionalImages(prev => {
            const updated = [...prev];
            if (updated[globalIndex]) {
              updated[globalIndex] = { ...updated[globalIndex], uploading: false };
            }
            return updated;
          });
        }
      });
    }
  };

  const handleUploadMainImage = async (file: File) => {
    setUploading(true);
    setMainImageChanged(true);
    
    try {
      // ID temporaire si on n'a pas encore de propertyId
      const tempId = propertyId || "temp-" + Date.now();
      const { imageUrl, error } = await uploadPropertyImage(tempId, file, true);
      
      if (error) throw new Error(error);
      
      setFormData(prev => ({ ...prev, imageUrl }));
      toast.success("Image principale téléchargée");
    } catch (error: any) {
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleUploadAdditionalImage = async (index: number) => {
    const image = additionalImages[index];
    if (!image.file) return;
    
    // Mettre à jour le statut de téléchargement
    setAdditionalImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], uploading: true };
      return updated;
    });
    
    try {
      const tempId = propertyId || "temp-" + Date.now();
      const { imageUrl, error } = await uploadPropertyImage(tempId, image.file, false, image.description);
      
      if (error) throw new Error(error);
      
      // Mettre à jour l'URL avec celle du serveur
      setAdditionalImages(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          url: imageUrl, 
          uploading: false,
          file: null // Le fichier a été téléchargé, on peut le supprimer
        };
        return updated;
      });
      
      toast.success("Image additionnelle téléchargée");
    } catch (error: any) {
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
      
      // Réinitialiser le statut de téléchargement
      setAdditionalImages(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], uploading: false };
        return updated;
      });
    }
  };

  const clearMainImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    setMainImageChanged(true);
  };
  
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const setImageAsPrimary = (index: number) => {
    // Si l'image est déjà principale, ne rien faire
    if (additionalImages[index].isPrimary) return;
    
    // Définir cette image comme principale
    const imageUrl = additionalImages[index].url;
    
    // Mettre à jour l'URL principale
    setFormData(prev => ({ ...prev, imageUrl }));
    setMainImageChanged(true);
    
    // Mettre à jour les drapeaux isPrimary
    setAdditionalImages(prev => {
      return prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
    });
    
    toast.success("Image principale mise à jour");
  };
  
  const handleDescriptionChange = (index: number, description: string) => {
    setAdditionalImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description };
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="mainImage">Image principale</Label>
        <div className="flex items-center gap-4">
          <Input
            id="mainImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainFileChange}
          />
          <div className="flex-1">
            {formData.imageUrl ? (
              <div className="relative h-40 w-full border rounded-md overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Aperçu de la propriété" 
                  className="h-full w-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearMainImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="mainImage"
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner une image principale
                </p>
              </label>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          L'image principale sera affichée comme aperçu de la propriété. Format recommandé: JPEG ou PNG, max 5MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalImages">Images additionnelles</Label>
        <div className="mb-2">
          <Input
            id="additionalImages"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAdditionalFileChange}
          />
          <label 
            htmlFor="additionalImages"
            className="flex items-center justify-center py-2 px-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 w-full"
          >
            <PlusCircle className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Ajouter des images</span>
          </label>
        </div>
        
        {additionalImages.length > 0 && (
          <ScrollArea className="h-80 border rounded-md p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
              {additionalImages.map((image, index) => (
                <div key={image.id} className="relative border rounded-md overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={`Image ${index + 1}`} 
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                        onClick={() => setImageAsPrimary(index)}
                        title="Définir comme image principale"
                      >
                        {image.isPrimary ? (
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <Star className="h-4 w-4 text-white" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                        onClick={() => removeAdditionalImage(index)}
                        title="Supprimer l'image"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Input
                        value={image.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        placeholder="Description (optionnelle)"
                        className="text-xs bg-white/10 border-white/20 placeholder:text-white/50 text-white"
                      />
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full text-xs"
                        onClick={() => handleUploadAdditionalImage(index)}
                        disabled={image.uploading || !image.file}
                      >
                        {image.uploading ? "Téléchargement..." : image.file ? "Télécharger" : "Téléchargé"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Ajoutez jusqu'à 10 images supplémentaires pour montrer plus de détails de la propriété.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="virtualTourUrl">URL de visite virtuelle (optionnel)</Label>
        <Input
          id="virtualTourUrl"
          name="virtualTourUrl"
          type="url"
          placeholder="https://exemple.com/visite-virtuelle"
          value={formData.virtualTourUrl}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ajoutez un lien vers une visite virtuelle (Matterport, YouTube 360, etc.)
        </p>
      </div>

      {(onNext || onBack) && (
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Retour
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              Suivant
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
