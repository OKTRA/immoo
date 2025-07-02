import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTenant, updateTenant } from "@/services/tenant/tenantService";
import { uploadIdentityPhotos } from "@/services/tenant/tenantMedia";
import { tenantFormSchema, TenantFormValues } from '../schemas/tenantFormSchema';

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
      toast.error("ID d'agence manquant. Impossible de créer le locataire.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating tenant with values:", values, "for agency:", agencyId);
      
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

      console.log("Creating tenant:", tenantData);
      const { tenant, error } = await createTenant(tenantData);

      if (error) {
        console.error("Error creating tenant:", error);
        throw new Error(error);
      }

      if (tenant) {
        // Upload identity photos if any
        let identityUrls: string[] = [];
        const files: File[] = (values as any).identityFiles || [];
        if (files.length > 0) {
          try {
            identityUrls = await uploadIdentityPhotos(tenant.id, files);
            await updateTenant(tenant.id, { identity_photos: identityUrls } as any);
          } catch (uploadErr) {
            console.error('Error uploading identity photos', uploadErr);
          }
        }

        console.log("Successfully created tenant:", tenant);
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
          photoUrl: tenant.photo_url,
          emergencyContact: tenant.emergency_contact,
          identityPhotos: identityUrls.length ? identityUrls : tenant.identity_photos,
          hasLease: false
        };
        
        onSuccess(mappedTenant);
      }
    } catch (error: any) {
      console.error("Error in tenant creation:", error);
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
