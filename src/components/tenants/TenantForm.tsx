
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X, User } from "lucide-react";
import { toast } from "sonner";
import { Tenant } from "@/assets/types";

// Define a custom interface for tenant form data that matches our expected fields
interface TenantFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  profession?: string;
  photoUrl?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface TenantFormProps {
  initialData: Partial<TenantFormData>;
  onUpdate: (data: Partial<TenantFormData>) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export default function TenantForm({ initialData, onUpdate, onFileUpload }: TenantFormProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    employmentStatus: initialData.employmentStatus || "",
    profession: initialData.profession || "",
    photoUrl: initialData.photoUrl || "",
    emergencyContact: initialData.emergencyContact || {
      name: "",
      phone: "",
      relationship: "",
    },
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Ref to keep track of current photoUrl for cleanup
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (formDataRef.current.photoUrl && formDataRef.current.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formDataRef.current.photoUrl);
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Clean up old blob URL if it exists
      if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoUrl);
      }
      
      // Create a preview
      const photoUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoUrl }));
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || !onFileUpload) {
      toast.error("Veuillez sélectionner une photo à télécharger");
      return;
    }

    setUploading(true);
    try {
      const photoUrl = await onFileUpload(photoFile);
      
      // Clean up old blob URL before setting new URL
      if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoUrl);
      }
      
      setFormData(prev => ({ ...prev, photoUrl }));
      setPhotoFile(null);
      toast.success("Photo téléchargée avec succès");
    } catch (error: any) {
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const clearPhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: "" }));
    setPhotoFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Photo upload section */}
      <div className="space-y-2">
        <Label htmlFor="photo">Photo du locataire</Label>
        <div className="flex items-center gap-4">
          <Input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <div className="flex-1">
            {formData.photoUrl ? (
              <div className="relative h-40 w-40 border rounded-full overflow-hidden mx-auto">
                <img 
                  src={formData.photoUrl} 
                  alt="Photo du locataire" 
                  className="h-full w-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearPhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="photo"
                className="flex flex-col items-center justify-center h-40 w-40 border-2 border-dashed rounded-full cursor-pointer hover:bg-muted/50 mx-auto"
              >
                <User className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Cliquez pour sélectionner une photo
                </p>
              </label>
            )}
          </div>
          {photoFile && onFileUpload && (
            <Button 
              onClick={handleUploadPhoto} 
              disabled={uploading}
              variant="secondary"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Chargement..." : "Télécharger"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>
            Prénom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Prénom du locataire"
            value={formData.firstName}
            onChange={handleChange}
            className={errors.firstName ? "border-destructive" : ""}
            required
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>
            Nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Nom du locataire"
            value={formData.lastName}
            onChange={handleChange}
            className={errors.lastName ? "border-destructive" : ""}
            required
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email du locataire"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "border-destructive" : ""}
          required
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>
          Téléphone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Numéro de téléphone"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? "border-destructive" : ""}
          required
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">Profession</Label>
        <Input
          id="profession"
          name="profession"
          placeholder="Profession du locataire"
          value={formData.profession}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employmentStatus">Situation professionnelle</Label>
        <Select 
          name="employmentStatus" 
          value={formData.employmentStatus} 
          onValueChange={(value) => handleSelectChange("employmentStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une situation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employed">Salarié</SelectItem>
            <SelectItem value="self-employed">Travailleur indépendant</SelectItem>
            <SelectItem value="student">Étudiant</SelectItem>
            <SelectItem value="retired">Retraité</SelectItem>
            <SelectItem value="unemployed">Sans emploi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t mt-6">
        <h3 className="text-lg font-medium mb-4">Contact d'urgence</h3>
        
        <div className="space-y-2">
          <Label htmlFor="emergencyName">Nom complet</Label>
          <Input
            id="emergencyName"
            name="name"
            placeholder="Nom de la personne à contacter"
            value={formData.emergencyContact?.name || ""}
            onChange={handleEmergencyContactChange}
          />
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="emergencyPhone">Téléphone</Label>
          <Input
            id="emergencyPhone"
            name="phone"
            type="tel"
            placeholder="Numéro de téléphone d'urgence"
            value={formData.emergencyContact?.phone || ""}
            onChange={handleEmergencyContactChange}
          />
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="emergencyRelationship">Relation</Label>
          <Select 
            value={formData.emergencyContact?.relationship || ""} 
            onValueChange={(value) => {
              setFormData(prev => ({
                ...prev,
                emergencyContact: {
                  ...prev.emergencyContact,
                  relationship: value
                }
              }));
            }}
          >
            <SelectTrigger id="emergencyRelationship">
              <SelectValue placeholder="Relation avec le locataire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family">Famille</SelectItem>
              <SelectItem value="spouse">Conjoint(e)</SelectItem>
              <SelectItem value="friend">Ami(e)</SelectItem>
              <SelectItem value="colleague">Collègue</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
