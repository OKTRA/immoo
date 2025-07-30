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
import { useAuth, useAuthStatus } from '@/hooks/useAuth';
import { checkUserResourceLimit } from '@/services/subscription/limit';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Lock, Crown } from "lucide-react";
import UpgradeButton from "@/components/subscription/UpgradeButton";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
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
  
  const { user, profile, initialized } = useAuth();
  const { isAuthenticated, isReady } = useAuthStatus();
  const isEditMode = !!propertyId;

  // Vérifier les limites dès le chargement du composant
  useEffect(() => {
    const checkLimits = async () => {
      // Attendre que l'auth soit prête et que l'utilisateur soit authentifié
      if (!isEditMode && isReady && isAuthenticated && user?.id) {
        console.log('🏠 CreatePropertyForm: Checking limits for user:', user.id);
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
              `${t('agencyDashboard.pages.createProperty.limitReached')} ${limit.maxAllowed} ${t('agencyDashboard.pages.createProperty.propertiesWithPlan')} ${limit.planName || t('agencyDashboard.pages.createProperty.currentPlan')}.`
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
  }, [isReady, isAuthenticated, user?.id, agencyId, isEditMode, t]);

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
        toast.error(t('agencyDashboard.pages.createProperty.subscriptionLimitReached'));
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
        toast.success(t('agencyDashboard.pages.createProperty.propertyUpdatedSuccessfully'));
      } else {
        result = await createProperty(propertyData);
        if (result.error) throw new Error(result.error);
        toast.success(t('agencyDashboard.pages.createProperty.propertyCreatedSuccessfully'));
      }
      
      console.log("Operation result:", result);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving property:", error);
      toast.error(`${t('agencyDashboard.pages.createProperty.error')}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage pendant le chargement de la vérification des limites
  if (limitCheck.loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>{t('agencyDashboard.pages.createProperty.checkingSubscriptionLimits')}</span>
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
            {t('agencyDashboard.pages.createProperty.subscriptionLimitReached')}
          </CardTitle>
          <CardDescription>
            {t('agencyDashboard.pages.createProperty.cannotCreateNewPropertyWithCurrentPlan')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('agencyDashboard.pages.createProperty.plan')} {limitCheck.planName || t('agencyDashboard.pages.createProperty.free')}</AlertTitle>
            <AlertDescription>
              {t('agencyDashboard.pages.createProperty.usingProperties')} <strong>{limitCheck.currentCount}</strong> {t('agencyDashboard.pages.createProperty.outOf')} <strong>{limitCheck.maxAllowed}</strong> {t('agencyDashboard.pages.createProperty.propertiesAllowed')}.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Crown className="h-4 w-4 mr-2 text-yellow-600" />
              {t('agencyDashboard.pages.createProperty.upgradeToHigherPlanFor')} :
            </h4>
            <ul className="text-sm space-y-1 ml-6">
              <li>• {t('agencyDashboard.pages.createProperty.createMoreProperties')}</li>
              <li>• {t('agencyDashboard.pages.createProperty.manageMoreLeases')}</li>
              <li>• {t('agencyDashboard.pages.createProperty.accessAdvancedFeatures')}</li>
              <li>• {t('agencyDashboard.pages.createProperty.prioritySupport')}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <UpgradeButton />
            <Button variant="outline" onClick={() => window.history.back()}>
              {t('agencyDashboard.pages.createProperty.back')}
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
          <AlertTitle className="text-orange-800">{t('agencyDashboard.pages.createProperty.warningLimitAlmostReached')}</AlertTitle>
          <AlertDescription className="text-orange-700">
            {t('agencyDashboard.pages.createProperty.usingProperties')} <strong>{limitCheck.currentCount}</strong> {t('agencyDashboard.pages.createProperty.outOf')} <strong>{limitCheck.maxAllowed}</strong> {t('agencyDashboard.pages.createProperty.propertiesAllowedWithPlan')} {limitCheck.planName || t('agencyDashboard.pages.createProperty.currentPlan')}.
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
              <TabsTrigger value="basic">{t('agencyDashboard.pages.createProperty.basicInfo')}</TabsTrigger>
              <TabsTrigger value="financial">{t('agencyDashboard.pages.createProperty.financialInfo')}</TabsTrigger>
              <TabsTrigger value="media">{t('agencyDashboard.pages.createProperty.media')}</TabsTrigger>
              <TabsTrigger value="ownership">{t('agencyDashboard.pages.createProperty.owner')}</TabsTrigger>
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
                {t('agencyDashboard.pages.createProperty.continue')}
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
                {t('agencyDashboard.pages.createProperty.back')}
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab('media')}
              >
                {t('agencyDashboard.pages.createProperty.continue')}
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
                {t('agencyDashboard.pages.createProperty.back')}
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab('ownership')}
              >
                {t('agencyDashboard.pages.createProperty.continue')}
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
                {t('agencyDashboard.pages.createProperty.back')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {isEditMode ? t('agencyDashboard.pages.createProperty.updating') : t('agencyDashboard.pages.createProperty.creating')}
                  </>
                ) : (
                  isEditMode ? t('agencyDashboard.pages.createProperty.updateProperty') : t('agencyDashboard.pages.createProperty.createProperty')
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
