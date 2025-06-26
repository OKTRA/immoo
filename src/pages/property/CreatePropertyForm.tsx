import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProperty, updateProperty } from "@/services/property";
import PropertyBasicInfoForm from "@/components/properties/PropertyBasicInfoForm";
import PropertyFinancialInfoForm from "@/components/properties/PropertyFinancialInfoForm";
import PropertyMediaForm from "@/components/properties/PropertyMediaForm";
import PropertyOwnershipForm from "@/components/properties/PropertyOwnershipForm";
import { useAuth } from '@/hooks/useAuth';
import { checkUserResourceLimit } from '@/services/subscription/limit';

interface CreatePropertyFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  propertyId?: string;
  agencyId?: string;
  onSuccess?: () => void;
}

export default function CreatePropertyForm({ 
  formData, 
  setFormData, 
  propertyId,
  agencyId,
  onSuccess 
}: CreatePropertyFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!propertyId;

  // This function has the correct signature to match the child component props
  const handleFormDataChange = (data: Partial<any>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // This function has the correct signature for nested object changes
  const handleNestedChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // CORRECTION: Vérifier les limites avant de créer une propriété
      if (!isEditMode) {
        const { user } = useAuth();
        
        if (user?.id) {
          const limit = await checkUserResourceLimit(user.id, 'properties', agencyId);
          if (!limit.allowed) {
            toast.error(
              `Limite atteinte : vous ne pouvez pas ajouter plus de ${limit.maxAllowed} propriétés avec votre abonnement actuel.`
            );
            return;
          }
        }
      }
      
      // Add the agency ID to the form data
      const propertyData = {
        ...formData,
        agencyId
      };
      
      console.log("Submitting property data:", propertyData);
      
      let result;
      
      if (isEditMode) {
        result = await updateProperty(propertyId!, propertyData);
        if (result.error) throw new Error(result.error);
        toast.success("Propriété mise à jour avec succès");
      } else {
        result = await createProperty(propertyData);
        if (result.error) throw new Error(result.error);
        toast.success("Propriété créée avec succès");
      }
      
      console.log("Operation result:", result);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving property:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs 
        defaultValue="basic" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <Card>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Informations de base</TabsTrigger>
            <TabsTrigger value="financial">Informations financières</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
            <TabsTrigger value="ownership">Propriétaire</TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="basic" className="space-y-4">
          <PropertyBasicInfoForm 
            initialData={formData} 
            onChange={handleFormDataChange} 
          />
          <div className="flex justify-end mt-4">
            <Button 
              type="button" 
              onClick={() => setActiveTab('financial')}
            >
              Continuer
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <PropertyFinancialInfoForm 
            initialData={formData} 
            onChange={handleFormDataChange} 
          />
          <div className="flex justify-between mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab('basic')}
            >
              Retour
            </Button>
            <Button 
              type="button" 
              onClick={() => setActiveTab('media')}
            >
              Continuer
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <PropertyMediaForm 
            initialData={formData} 
            onChange={handleFormDataChange} 
            propertyId={propertyId}
          />
          <div className="flex justify-between mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab('financial')}
            >
              Retour
            </Button>
            <Button 
              type="button" 
              onClick={() => setActiveTab('ownership')}
            >
              Continuer
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4">
          <PropertyOwnershipForm 
            initialData={formData} 
            onChange={handleFormDataChange}
            onNestedChange={handleNestedChange} 
          />
          <div className="flex justify-between mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab('media')}
            >
              Retour
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {isEditMode ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                isEditMode ? "Mettre à jour la propriété" : "Créer la propriété"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
