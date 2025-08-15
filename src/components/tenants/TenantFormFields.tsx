import React, { useState, useEffect, useRef } from 'react';
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
import { useTranslation } from "@/hooks/useTranslation";

const TenantFormFields = () => {
  const { control, setValue, watch } = useFormContext<TenantFormValues>();
  const { t } = useTranslation();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);
  const photoUrl = watch('photoUrl');
  const identityPhotos = watch('identityPhotos');
  const emergencyContact = watch('emergencyContact');

  // Refs to keep track of current URLs for cleanup
  const photoUrlRef = useRef(photoUrl);
  const identityPhotosRef = useRef(identityPhotos);
  
  useEffect(() => {
    photoUrlRef.current = photoUrl;
  }, [photoUrl]);

  useEffect(() => {
    identityPhotosRef.current = identityPhotos;
  }, [identityPhotos]);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (photoUrlRef.current && photoUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(photoUrlRef.current);
      }
      if (identityPhotosRef.current) {
        identityPhotosRef.current.forEach((url: string) => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Clean up old blob URL if it exists
      if (photoUrl && photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoUrl);
      }
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setValue('photoUrl', previewUrl);
    }
  };

  const clearPhoto = () => {
    // Clean up blob URL before clearing
    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
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
            {t('agencyDashboard.pages.tenants.tenantPhoto')}
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
                  alt={t('agencyDashboard.pages.tenants.tenantPhoto')} 
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
                {t('agencyDashboard.pages.tenants.addPhoto')}
              </p>
            </label>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium">{t('agencyDashboard.pages.tenants.personalInformation')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('agencyDashboard.pages.tenants.firstName')} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder={t('agencyDashboard.pages.tenants.firstName')} {...field} />
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
                <FormLabel>{t('agencyDashboard.pages.tenants.lastName')} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder={t('agencyDashboard.pages.tenants.lastName')} {...field} />
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
                <FormLabel>{t('agencyDashboard.pages.tenants.email')} <span className="text-destructive">*</span></FormLabel>
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
                <FormLabel>{t('agencyDashboard.pages.tenants.phone')} <span className="text-destructive">*</span></FormLabel>
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
                <FormLabel>{t('agencyDashboard.pages.tenants.profession')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('agencyDashboard.pages.tenants.professionOptional')} {...field} />
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
                <FormLabel>{t('agencyDashboard.pages.tenants.employmentStatus')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('agencyDashboard.pages.tenants.selectStatus')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employed">{t('agencyDashboard.pages.tenants.employed')}</SelectItem>
                    <SelectItem value="self-employed">{t('agencyDashboard.pages.tenants.selfEmployed')}</SelectItem>
                    <SelectItem value="student">{t('agencyDashboard.pages.tenants.student')}</SelectItem>
                    <SelectItem value="retired">{t('agencyDashboard.pages.tenants.retired')}</SelectItem>
                    <SelectItem value="unemployed">{t('agencyDashboard.pages.tenants.unemployed')}</SelectItem>
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
            {t('agencyDashboard.pages.tenants.emergencyContact')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('agencyDashboard.pages.tenants.emergencyContactDescription')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">{t('agencyDashboard.pages.tenants.fullName')}</Label>
            <Input
              id="emergencyName"
              placeholder={t('agencyDashboard.pages.tenants.emergencyContactName')}
              value={emergencyContact?.name || ''}
              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">{t('agencyDashboard.pages.tenants.phone')}</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              placeholder={t('agencyDashboard.pages.tenants.emergencyPhoneNumber')}
              value={emergencyContact?.phone || ''}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyRelationship">{t('agencyDashboard.pages.tenants.relationship')}</Label>
            <Select 
              value={emergencyContact?.relationship || ''} 
              onValueChange={(value) => handleEmergencyContactChange('relationship', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('agencyDashboard.pages.tenants.relationshipWithTenant')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">{t('agencyDashboard.pages.tenants.family')}</SelectItem>
                <SelectItem value="parent">{t('agencyDashboard.pages.tenants.parent')}</SelectItem>
                <SelectItem value="spouse">{t('agencyDashboard.pages.tenants.spouse')}</SelectItem>
                <SelectItem value="sibling">{t('agencyDashboard.pages.tenants.sibling')}</SelectItem>
                <SelectItem value="friend">{t('agencyDashboard.pages.tenants.friend')}</SelectItem>
                <SelectItem value="colleague">{t('agencyDashboard.pages.tenants.colleague')}</SelectItem>
                <SelectItem value="other">{t('agencyDashboard.pages.tenants.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Identity Photos */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium">{t('agencyDashboard.pages.tenants.identityPhotos')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('agencyDashboard.pages.tenants.identityPhotosDescription')}
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
          <span className="text-sm text-muted-foreground">{t('agencyDashboard.pages.tenants.clickOrDragToAddPhotos')}</span>
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
                    
                    // Clean up the blob URL being removed
                    const urlToRemove = currentPhotos[idx];
                    if (urlToRemove && urlToRemove.startsWith('blob:')) {
                      URL.revokeObjectURL(urlToRemove);
                    }
                    
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
