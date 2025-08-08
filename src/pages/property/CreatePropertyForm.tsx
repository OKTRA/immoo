import React, { useState, useEffect, useCallback } from 'react';
import { useMobileToast } from '@/hooks/useMobileToast';
import { toast } from 'sonner';
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
import { AlertTriangle, Lock, Crown, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import UpgradeButton from "@/components/subscription/UpgradeButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';

interface CreatePropertyFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  propertyId?: string;
  agencyId?: string;
  onSuccess?: () => void;
}

const STEPS = [
  { id: "basic", label: "Informations de base", icon: "🏠" },
  { id: "financial", label: "Informations financières", icon: "💰" },
  { id: "media", label: "Médias", icon: "📸" },
  { id: "ownership", label: "Propriétaire", icon: "👤" }
];

export default function CreatePropertyForm({ 
  formData, 
  setFormData, 
  propertyId,
  agencyId,
  onSuccess 
}: CreatePropertyFormProps) {
  const mobileToast = useMobileToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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

  // Calculate progress
  const currentStepIndex = STEPS.findIndex(step => step.id === activeTab);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Vérifier les limites dès le chargement du composant
  useEffect(() => {
    const checkLimits = async () => {
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

  // Tentative de correction automatique de la propriété d'agence si possible
  const ensureAgencyOwnership = useCallback(async (): Promise<boolean> => {
    if (!agencyId || !user?.id) return false;
    // 1) Re-check direct ownership
    const { data: owned, error: ownedErr } = await supabase
      .from('agencies')
      .select('id')
      .eq('id', agencyId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!ownedErr && owned) return true;

    // 2) Try auto-repair if agency email matches user email
    const userEmail = user.email?.toLowerCase();
    if (!userEmail) return false;
    const { data: agency, error: agencyErr } = await supabase
      .from('agencies')
      .select('id, email, user_id')
      .eq('id', agencyId)
      .maybeSingle();
    if (agencyErr || !agency) return false;

    const agencyEmail = (agency.email || '').toLowerCase();
    if (agencyEmail && agencyEmail === userEmail) {
      // Link agency to current user
      const { error: linkErr } = await supabase
        .from('agencies')
        .update({ user_id: user.id })
        .eq('id', agencyId);
      if (linkErr) return false;

      // Best-effort: link profile to agency (support both schemas)
      await supabase.from('profiles').update({ agency_id: agencyId }).eq('id', user.id);
      await supabase.from('profiles').update({ agency_id: agencyId }).eq('user_id', user.id);

      // Re-check
      const { data: recheck } = await supabase
        .from('agencies')
        .select('id')
        .eq('id', agencyId)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!recheck;
    }

    return false;
  }, [agencyId, user?.id, user?.email]);

  const handleFormDataChange = useCallback((data: Partial<any>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, [setFormData]);

  const handleNestedChange = useCallback((parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  }, [setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!isEditMode && !limitCheck.allowed) {
        toast.error(t('agencyDashboard.pages.createProperty.subscriptionLimitReached'));
        return;
      }
      // Vérifier la validité et l'appartenance de l'agence avant l'insertion
      if (!agencyId) {
        throw new Error(t('agencyDashboard.pages.createProperty.missingAgency') || 'Agence introuvable');
      }
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      const { data: agencyCheck, error: agencyCheckError } = await supabase
        .from('agencies')
        .select('id')
        .eq('id', agencyId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (agencyCheckError) {
        console.error('Agency ownership check failed:', agencyCheckError);
        toast.error('Problème de connexion au service. Vérifiez votre connexion internet et réessayez.');
        return;
      }
      if (!agencyCheck) {
        // Try automatic repair
        const repaired = await ensureAgencyOwnership();
        if (!repaired) {
          throw new Error('Vous ne pouvez pas créer de propriété pour cette agence');
        }
      }
      
      const propertyData = {
        ...formData,
        agencyId
      };
      
      console.log("Submitting property data:", propertyData);
      
      let result;
      
      if (isEditMode) {
        result = await updateProperty(propertyId!, propertyData);
        if (result.error) throw new Error(result.error);
        mobileToast.success(t('agencyDashboard.pages.createProperty.propertyUpdatedSuccessfully'), {}, true);
      } else {
        result = await createProperty(propertyData);
        if (result.error) throw new Error(result.error);
        mobileToast.success(t('agencyDashboard.pages.createProperty.propertyCreatedSuccessfully'), {}, true);
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

  const nextStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === activeTab);
    if (currentIndex < STEPS.length - 1) {
      setActiveTab(STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(STEPS[currentIndex - 1].id);
    }
  };

  // Loading state
  if (limitCheck.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">
            {t('agencyDashboard.pages.createProperty.checkingSubscriptionLimits')}
          </p>
          <p className="text-sm text-muted-foreground">
            Vérification de vos limites d'abonnement...
          </p>
        </div>
      </div>
    );
  }

  // Limit reached state
  if (!isEditMode && !limitCheck.allowed) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/50 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              {t('agencyDashboard.pages.createProperty.subscriptionLimitReached')}
            </CardTitle>
            <CardDescription className="text-lg">
              {t('agencyDashboard.pages.createProperty.cannotCreateNewPropertyWithCurrentPlan')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <AlertTitle className="text-orange-800">
                Plan {limitCheck.planName || t('agencyDashboard.pages.createProperty.free')}
              </AlertTitle>
              <AlertDescription className="text-orange-700">
                Vous utilisez <strong>{limitCheck.currentCount}</strong> propriétés sur <strong>{limitCheck.maxAllowed}</strong> autorisées.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
              <h4 className="font-semibold mb-4 flex items-center text-lg">
                <Crown className="h-5 w-5 mr-2 text-yellow-600" />
                Passez à un plan supérieur pour :
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Créer plus de propriétés
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Gérer plus de baux
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Accéder aux fonctionnalités avancées
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Support prioritaire
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <UpgradeButton className="flex-1" />
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('agencyDashboard.pages.createProperty.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? 'Modifier la propriété' : 'Ajouter une nouvelle propriété'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Modifiez les informations de votre propriété' : 'Créez une nouvelle propriété en quelques étapes simples'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        {!isMobile && (
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step.id === activeTab 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : index < currentStepIndex 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-muted bg-muted text-muted-foreground'
                }`}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.id === activeTab ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Alert */}
      {!isEditMode && limitCheck.allowed && limitCheck.currentCount >= limitCheck.maxAllowed * 0.8 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            {t('agencyDashboard.pages.createProperty.warningLimitAlmostReached')}
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            Vous utilisez <strong>{limitCheck.currentCount}</strong> propriétés sur <strong>{limitCheck.maxAllowed}</strong> autorisées avec le plan {limitCheck.planName || t('agencyDashboard.pages.createProperty.currentPlan')}.
            <div className="mt-3">
              <UpgradeButton variant="outline" size="sm" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <Tabs 
              defaultValue="basic" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              {/* Mobile Tabs */}
              {isMobile && (
                <div className="mb-6">
                  <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-muted/50">
                    {STEPS.map((step) => (
                      <TabsTrigger 
                        key={step.id} 
                        value={step.id}
                        className="flex flex-col items-center space-y-1 py-3 px-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <span className="text-lg">{step.icon}</span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              )}

              {/* Desktop Tabs */}
              {!isMobile && (
                <div className="mb-6">
                  <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-muted/50">
                    {STEPS.map((step) => (
                      <TabsTrigger 
                        key={step.id} 
                        value={step.id}
                        className="flex items-center space-x-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <span>{step.icon}</span>
                        <span>{step.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              )}

              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">🏠</span>
                    Informations de base
                  </h3>
                  <p className="text-muted-foreground">
                    Commencez par les informations essentielles de votre propriété
                  </p>
                </div>
                <PropertyBasicInfoForm 
                  initialData={formData} 
                  onChange={handleFormDataChange} 
                />
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">💰</span>
                    Informations financières
                  </h3>
                  <p className="text-muted-foreground">
                    Définissez les prix et conditions financières
                  </p>
                </div>
                <PropertyFinancialInfoForm 
                  initialData={formData} 
                  onChange={handleFormDataChange} 
                />
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">📸</span>
                    Médias
                  </h3>
                  <p className="text-muted-foreground">
                    Ajoutez des photos et vidéos pour présenter votre propriété
                  </p>
                </div>
                <PropertyMediaForm 
                  initialData={formData} 
                  onChange={handleFormDataChange} 
                  propertyId={propertyId}
                />
              </TabsContent>

              <TabsContent value="ownership" className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">👤</span>
                    Informations du propriétaire
                  </h3>
                  <p className="text-muted-foreground">
                    Renseignez les informations du propriétaire
                  </p>
                </div>
                <PropertyOwnershipForm 
                  initialData={formData} 
                  onChange={handleFormDataChange}
                  onNestedChange={handleNestedChange} 
                />
              </TabsContent>
            </Tabs>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  Étape {currentStepIndex + 1} sur {STEPS.length}
                </Badge>
              </div>

              {currentStepIndex < STEPS.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex items-center"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Mettre à jour' : 'Créer la propriété'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
