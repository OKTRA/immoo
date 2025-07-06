je import React, { useState } from 'react';
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Upload, X, Phone, UserCheck } from 'lucide-react';
import { TenantFormValues } from './schemas/tenantFormSchema';

const TenantFormFields = () => {
  const { control, setValue, watch } = useFormContext<TenantFormValues>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);
  const photoUrl = watch('photoUrl');
  const emergencyContact = watch('emergencyContact');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setValue('photoUrl', previewUrl);
    }
  };

  const clearPhoto = () => {
    setValue('photoUrl', '');
    setPhotoFile(null);
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setValue('emergencyContact', {
      ...emergencyContact,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* Photo Section */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium flex items-center">
            <User className="mr-2 h-5 w-5" />
            Photo du locataire
          </h3>
        </div>
        
        <div className="flex items-center justify-center">
          <Input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          
          {photoUrl ? (
            <div className="relative">
              <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-full overflow-hidden">
                <img 
                  src={photoUrl} 
                  alt="Photo du locataire" 
                  className="h-full w-full object-cover"
                />
              </div>
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                onClick={clearPhoto}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label 
              htmlFor="photo"
              className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <User className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground text-center px-2">
                Ajouter une photo
              </p>
            </label>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium">Informations personnelles</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="+223 XX XX XX XX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="profession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profession</FormLabel>
                <FormControl>
                  <Input placeholder="Profession (optionnel)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut professionnel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employed">Salarié</SelectItem>
                    <SelectItem value="self-employed">Travailleur indépendant</SelectItem>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="retired">Retraité</SelectItem>
                    <SelectItem value="unemployed">Sans emploi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            Contact d'urgence
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Personne à contacter en cas d'urgence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Nom complet</Label>
            <Input
              id="emergencyName"
              placeholder="Nom de la personne à contacter"
              value={emergencyContact?.name || ''}
              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Téléphone</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              placeholder="Numéro de téléphone d'urgence"
              value={emergencyContact?.phone || ''}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyRelationship">Relation</Label>
            <Select 
              value={emergencyContact?.relationship || ''} 
              onValueChange={(value) => handleEmergencyContactChange('relationship', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Relation avec le locataire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Famille</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="spouse">Conjoint(e)</SelectItem>
                <SelectItem value="sibling">Frère/Sœur</SelectItem>
                <SelectItem value="friend">Ami(e)</SelectItem>
                <SelectItem value="colleague">Collègue</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Identity Photos */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium">Photos d'identité (multiples)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Téléchargez une ou plusieurs photos d'identité (CNI, passeport…)
          </p>
        </div>

        <Input
          id="identityPhotos"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const filesArray = Array.from(e.target.files);
              const previews = filesArray.map((file) => URL.createObjectURL(file));
              // Merge with existing previews and files
              const currentPhotos = watch('identityPhotos') || [];
              const currentFiles = identityFiles;
              setValue('identityPhotos', [...currentPhotos, ...previews]);
              setIdentityFiles([...currentFiles, ...filesArray]);
              setValue('identityFiles', [...currentFiles, ...filesArray] as any);
            }
          }}
        />

        <label
          htmlFor="identityPhotos"
          className="flex flex-col items-center justify-center w-full md:w-1/2 border-2 border-dashed border-gray-300 py-6 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Cliquer ou glisser-déposer pour ajouter des photos</span>
        </label>

        {/* Previews grid */}
        {watch('identityPhotos') && watch('identityPhotos')!.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
            {watch('identityPhotos')!.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt={`ID-${idx}`} className="h-24 w-24 object-cover rounded" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const currentPhotos = watch('identityPhotos') || [];
                    const currentFiles = identityFiles;
                    setValue('identityPhotos', currentPhotos.filter((__, i) => i !== idx));
                    const newFiles = currentFiles.filter((__, i) => i !== idx);
                    setIdentityFiles(newFiles);
                    setValue('identityFiles', newFiles as any);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantFormFields;
