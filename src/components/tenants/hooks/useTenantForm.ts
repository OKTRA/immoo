import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTenant, updateTenant } from "@/services/tenant/tenantCrud";
import { tenantFormSchema, TenantFormValues } from "@/components/tenants/schemas/tenantFormSchema";
import { uploadIdentityPhotos, uploadProfilePhoto } from "@/services/tenant/tenantMedia";

interface UseTenantFormProps {
  agencyId?: string;
  onSuccess: (tenant: any) => void;
}

export const useTenantForm = ({ agencyId, onSuccess }: UseTenantFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profession: "",
      employmentStatus: "",
      photoUrl: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      identityPhotos: [],
      identityFiles: [],
    },
  });

  const onSubmit = async (values: TenantFormValues) => {
    if (!agencyId) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert form values to the format expected by the API
      const tenantData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        profession: values.profession || null,
        employment_status: values.employmentStatus || null,
        photo_url: values.photoUrl || null,
        emergency_contact: values.emergencyContact && (values.emergencyContact.name || values.emergencyContact.phone || values.emergencyContact.relationship) 
          ? values.emergencyContact 
          : null,
        agency_id: agencyId
      };

      const { tenant, error } = await createTenant(tenantData);

      if (error) {
        throw new Error(error);
      }

      if (tenant) {
        // Upload profile photo if provided
        let profilePhotoUrl: string | null = null;
        if (values.photoUrl && values.photoUrl.startsWith('blob:')) {
          try {
            // Convert blob URL to File object
            const response = await fetch(values.photoUrl);
            const blob = await response.blob();
            const file = new File([blob], 'profile-photo.jpg', { type: blob.type });
            profilePhotoUrl = await uploadProfilePhoto(tenant.id, file);
          } catch (uploadErr) {
            // Silent fail - photo upload is not critical
          }
        }

        // Upload identity photos if any
        let identityUrls: string[] = [];
        const files: File[] = (values as any).identityFiles || [];
        if (files.length > 0) {
          try {
            identityUrls = await uploadIdentityPhotos(tenant.id, files);
          } catch (uploadErr) {
            // Silent fail - identity photos upload is not critical
          }
        }

        // Update tenant with photo URLs
        if (profilePhotoUrl || identityUrls.length > 0) {
          const updateData: any = {};
          if (profilePhotoUrl) updateData.photo_url = profilePhotoUrl;
          if (identityUrls.length > 0) updateData.identity_photos = identityUrls;
          
          await updateTenant(tenant.id, updateData);
        }

        toast.success("Locataire ajouté avec succès!");
        
        // Map back to the format expected by the parent component
        const mappedTenant = {
          id: tenant.id,
          firstName: tenant.first_name,
          lastName: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone,
          profession: tenant.profession,
          employmentStatus: tenant.employment_status,
          photoUrl: profilePhotoUrl || tenant.photo_url,
          emergencyContact: tenant.emergency_contact,
          identityPhotos: identityUrls.length ? identityUrls : tenant.identity_photos,
          hasLease: false
        };
        
        onSuccess(mappedTenant);
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la création du locataire: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit)
  };
};
