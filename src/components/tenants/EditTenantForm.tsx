import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck, X, Loader2 } from 'lucide-react';
import { updateTenant } from "@/services/tenant/tenantService";
import { uploadIdentityPhotos } from "@/services/tenant/tenantMedia";
import { tenantFormSchema, TenantFormValues } from './schemas/tenantFormSchema';
import TenantFormFields from './TenantFormFields';

interface EditTenantFormProps {
  tenant: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    profession?: string;
    employmentStatus?: string;
    photoUrl?: string;
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
    identityPhotos?: string[];
  };
  onCancel: () => void;
  onSuccess: (updatedTenant: any) => void;
}

export default function EditTenantForm({ tenant, onCancel, onSuccess }: EditTenantFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      firstName: tenant.firstName || "",
      lastName: tenant.lastName || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      profession: tenant.profession || "",
      employmentStatus: tenant.employmentStatus || "",
      photoUrl: tenant.photoUrl || "",
      emergencyContact: tenant.emergencyContact || {
        name: "",
        phone: "",
        relationship: "",
      },
      identityPhotos: tenant.identityPhotos || [],
      identityFiles: [],
    },
  });

  const onSubmit = async (values: TenantFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating tenant with values:", values);
      
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
        identity_photos: values.identityPhotos && values.identityPhotos.length > 0 ? values.identityPhotos : null,
      };

      console.log("Sending tenant update data:", tenantData);
      const { tenant: baseTenant, error } = await updateTenant(tenant.id, tenantData);

      if (error) {
        console.error("Error updating tenant:", error);
        throw new Error(error);
      }

      let allIdentityUrls = baseTenant.identity_photos || [];

      const newFiles: File[] = (values as any).identityFiles || [];
      if (newFiles.length > 0) {
        try {
          const newUrls = await uploadIdentityPhotos(tenant.id, newFiles);
          allIdentityUrls = [...allIdentityUrls, ...newUrls];
          await updateTenant(tenant.id, { identity_photos: allIdentityUrls } as any);
        } catch (uploadErr) {
          console.error('Error uploading new identity photos', uploadErr);
        }
      }

      const updatedTenant = { ...baseTenant, identity_photos: allIdentityUrls };

      if (updatedTenant) {
        console.log("Successfully updated tenant:", updatedTenant);
        toast.success("Locataire modifié avec succès!");
        
        // Map back to the format expected by the parent component
        const mappedTenant = {
          id: updatedTenant.id,
          firstName: updatedTenant.first_name,
          lastName: updatedTenant.last_name,
          email: updatedTenant.email,
          phone: updatedTenant.phone,
          profession: updatedTenant.profession,
          employmentStatus: updatedTenant.employment_status,
          photoUrl: updatedTenant.photo_url,
          emergencyContact: updatedTenant.emergency_contact,
          identityPhotos: updatedTenant.identity_photos,
        };
        
        onSuccess(mappedTenant);
      }
    } catch (error: any) {
      console.error("Error in tenant update:", error);
      toast.error(`Erreur lors de la modification du locataire: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCheck className="mr-2 h-5 w-5" />
          Modifier le locataire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TenantFormFields />
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onCancel} type="button">
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="mr-2 h-4 w-4" />
                )}
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 