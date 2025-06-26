import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProperty, updateProperty } from "@/services/property";
import PropertyBasicInfoForm from "@/components/properties/PropertyBasicInfoForm";
import PropertyFinancialInfoForm from "@/components/properties/PropertyFinancialInfoForm";
import PropertyMediaForm from "@/components/properties/PropertyMediaForm";
import PropertyOwnershipForm from "@/components/properties/PropertyOwnershipForm";
import { useAuth } from '@/hooks/useAuth';
import { checkUserResourceLimit } from '@/services/subscription/limit';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Lock, Crown } from "lucide-react";
import UpgradeButton from "@/components/subscription/UpgradeButton";

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
  const [limitCheck, setLimitCheck] = useState<{
    allowed: boolean;
    currentCount: number;
    maxAllowed: number;
    planName?: string;
    loading: boolean;
    error?: string;
  }>({
    allowed: true,
    currentCount: 0,
    maxAllowed: 0,
    loading: true
  });
  
  const { user } = useAuth();
  const isEditMode = !!propertyId;

  // Vérifier les limites dès le chargement du composant
  useEffect(() => {
    const checkLimits = async () => {
      if (!isEditMode && user?.id) {
        try {
          const limit = await checkUserResourceLimit(user.id, 'properties', agencyId);
          setLimitCheck({
            allowed: limit.allowed,
            currentCount: limit.currentCount,
            maxAllowed: limit.maxAllowed,
            planName: limit.planName,
            loading: false,
            error: limit.error
          });

          if (!limit.allowed) {
            toast.error(
              `Limite atteinte : vous ne pouvez pas ajouter plus de ${limit.maxAllowed} propriétés avec votre plan ${limit.planName || 'actuel'}.`
            );
          }
        } catch (error: any) {
          setLimitCheck({
            allowed: false,
            currentCount: 0,
            maxAllowed: 0,
            loading: false,
            error: error.message
          });
        }
      } else {
        // Mode édition ou pas d'utilisateur
        setLimitCheck({
          allowed: true,
          currentCount: 0,
          maxAllowed: 0,
          loading: false
        });
      }
    };

    checkLimits();
  }, [user?.id, agencyId, isEditMode]);

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
      // Double vérification des limites avant soumission
      if (!isEditMode && !limitCheck.allowed) {
        toast.error("Limite d'abonnement atteinte. Veuillez passer à un plan supérieur.");
        return;
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

  // Affichage pendant le chargement de la vérification des limites
  if (limitCheck.loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Vérification des limites d'abonnement...</span>
      </div>
    );
  }

  // Affichage si limite atteinte
  if (!isEditMode && !limitCheck.allowed) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <Lock className="h-5 w-5 mr-2" />
            Limite d'abonnement atteinte
          </CardTitle>
          <CardDescription>
            Vous ne pouvez pas créer de nouvelle propriété avec votre plan actuel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Plan {limitCheck.planName || 'gratuit'}</AlertTitle>
            <AlertDescription>
              Vous utilisez actuellement <strong>{limitCheck.currentCount}</strong> sur <strong>{limitCheck.maxAllowed}</strong> propriétés autorisées.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Crown className="h-4 w-4 mr-2 text-yellow-600" />
              Passez à un plan supérieur pour :
            </h4>
            <ul className="text-sm space-y-1 ml-6">
              <li>• Créer plus de propriétés</li>
              <li>• Gérer plus de baux</li>
              <li>• Accéder à des fonctionnalités avancées</li>
              <li>• Support prioritaire</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <UpgradeButton />
            <Button variant="outline" onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Affichage normal du formulaire
  return (
    <div className="space-y-4">
      {/* Avertissement si proche de la limite */}
      {!isEditMode && limitCheck.allowed && limitCheck.currentCount >= limitCheck.maxAllowed * 0.8 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Attention : Limite bientôt atteinte</AlertTitle>
          <AlertDescription className="text-orange-700">
            Vous utilisez <strong>{limitCheck.currentCount}</strong> sur <strong>{limitCheck.maxAllowed}</strong> propriétés autorisées avec votre plan {limitCheck.planName || 'actuel'}.
            <div className="mt-2">
              <UpgradeButton variant="outline" size="sm" />
            </div>
          </AlertDescription>
        </Alert>
      )}

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
    </div>
  );
}
