import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Upload, X, User, FileText, Camera, Image, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface TenantDocumentsFormProps {
  initialData: any;
  onChange: (data: any) => void;
  tenantId?: string;
  onNext?: () => void;
  onBack?: () => void;
}

export default function TenantDocumentsForm({ 
  initialData, 
  onChange, 
  tenantId,
  onNext, 
  onBack 
}: TenantDocumentsFormProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    photoUrl: initialData.photoUrl || "",
    identityPhotos: initialData.identityPhotos || [],
    identityFiles: initialData.identityFiles || [],
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const isMounted = useRef(false);
  const lastUpdateRef = useRef<any>({});

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const hasChanged = Object.keys(formData).some(
      key => {
        if (key === 'identityPhotos' || key === 'identityFiles') {
          return JSON.stringify(formData[key]) !== JSON.stringify(lastUpdateRef.current[key]);
        }
        return formData[key as keyof typeof formData] !== lastUpdateRef.current[key];
      }
    );

    if (hasChanged) {
      lastUpdateRef.current = formData;
      onChange(formData);
    }
  }, [formData, onChange]);

  useEffect(() => {
    if (isMounted.current && initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        photoUrl: initialData.photoUrl || prev.photoUrl,
        identityPhotos: initialData.identityPhotos || prev.identityPhotos,
        identityFiles: initialData.identityFiles || prev.identityFiles,
      }));
    }
  }, [initialData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner un fichier image");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }

      setPhotoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoUrl: previewUrl }));
    }
  };

  const handleIdentityFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate files
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
          toast.error(`${file.name} n'est pas un fichier valide`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} ne doit pas dépasser 10MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        const newFiles = [...identityFiles, ...validFiles];
        setIdentityFiles(newFiles);
        setFormData(prev => ({ ...prev, identityFiles: newFiles }));

        // Create preview URLs for images
        const newPreviewUrls = validFiles
          .filter(file => file.type.startsWith('image/'))
          .map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

        toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
      }
    }
  };

  const clearPhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: "" }));
    setPhotoFile(null);
    if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.photoUrl);
    }
  };

  const removeIdentityFile = (index: number) => {
    const newFiles = identityFiles.filter((_, i) => i !== index);
    setIdentityFiles(newFiles);
    setFormData(prev => ({ ...prev, identityFiles: newFiles }));

    // Remove preview URL if it exists
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openPreview = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Profile Photo */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Camera className="mr-2 h-5 w-5 text-primary" />
              Photo de profil
            </h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez une photo du locataire (optionnel)
            </p>
          </div>

          <div className="space-y-4">
            {formData.photoUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={formData.photoUrl}
                    alt="Photo de profil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full"
                    onClick={clearPhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Photo de profil ajoutée
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/20">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Aucune photo de profil
                  </p>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4 mr-2" />
                      Ajouter une photo
                    </div>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identity Documents */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Documents d'identité
            </h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez les documents d'identité du locataire (optionnel)
            </p>
          </div>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <Label htmlFor="identity-files-upload" className="cursor-pointer">
                <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner des fichiers
                </div>
              </Label>
              <Input
                id="identity-files-upload"
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleIdentityFilesChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Formats acceptés : JPG, PNG, PDF (max 10MB par fichier)
              </p>
            </div>

            {/* Files List */}
            {identityFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Fichiers sélectionnés ({identityFiles.length})</h4>
                <div className="grid gap-3">
                  {identityFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') && previewUrls[index] && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreview(previewUrls[index])}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIdentityFile(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      {(formData.photoUrl || identityFiles.length > 0) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Résumé des documents
              </h4>
              <div className="grid gap-3 text-sm">
                {formData.photoUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Photo de profil :</span>
                    <Badge variant="default" className="bg-green-500">✓</Badge>
                  </div>
                )}
                {identityFiles.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Documents d'identité :</span>
                    <span className="font-medium">{identityFiles.length} fichier(s)</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <FileText className="mr-2 h-4 w-4 text-primary" />
              Recommandations
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Photo de profil : Format JPG ou PNG, max 5MB</p>
              <p>• Documents d'identité : JPG, PNG ou PDF, max 10MB par fichier</p>
              <p>• Assurez-vous que les documents sont lisibles et complets</p>
              <p>• Les documents d'identité sont optionnels mais recommandés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {(onNext || onBack) && (
        <div className="flex justify-between items-center pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Précédent
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              Continuer
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 