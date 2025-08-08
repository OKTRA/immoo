
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import CreatePropertyForm from "./CreatePropertyForm";
import usePropertyData from "./usePropertyData";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function CreatePropertyPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { formData, setFormData, isLoading, isEditMode } = usePropertyData(propertyId);
  const { user } = useAuth();
  const [agencyAllowed, setAgencyAllowed] = useState<boolean | null>(null);

  const handleNavigateBack = () => {
    navigate(`/agencies/${agencyId}`);
  };

  // Guard: ensure the agency belongs to the current user (only for create mode)
  useEffect(() => {
    const checkAgencyOwnership = async () => {
      if (!agencyId || isEditMode) {
        setAgencyAllowed(true);
        return;
      }
      if (!user?.id) {
        setAgencyAllowed(false);
        toast.error('Utilisateur non authentifié');
        return;
      }

      const { data, error } = await supabase
        .from('agencies')
        .select('id')
        .eq('id', agencyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Agency ownership guard failed:', error);
        toast.error('Problème de connexion au service. Vérifiez votre connexion internet.');
        setAgencyAllowed(false);
        return;
      }

      if (!data) {
        // Attempt automatic repair: link by matching email
        const userEmail = user.email?.toLowerCase();
        const { data: agency, error: agencyErr } = await supabase
          .from('agencies')
          .select('id, email, user_id')
          .eq('id', agencyId)
          .maybeSingle();
        if (!agencyErr && agency && userEmail && (agency.email || '').toLowerCase() === userEmail) {
          const { error: linkErr } = await supabase
            .from('agencies')
            .update({ user_id: user.id })
            .eq('id', agencyId);
          if (!linkErr) {
            // Best-effort profile link
            await supabase.from('profiles').update({ agency_id: agencyId }).eq('id', user.id);
            await supabase.from('profiles').update({ agency_id: agencyId }).eq('user_id', user.id);
            setAgencyAllowed(true);
            return;
          }
        }
        toast.error('Cette agence ne vous appartient pas.');
        setAgencyAllowed(false);
        return;
      }

      setAgencyAllowed(true);
    };

    checkAgencyOwnership();
  }, [agencyId, isEditMode, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNavigateBack}
            className="mb-4 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isMobile ? 'Retour' : t('agencyDashboard.pages.createProperty.backToAgency')}
          </Button>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isEditMode ? 'Modifier la propriété' : 'Nouvelle propriété'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isEditMode 
                ? 'Mettez à jour les informations de votre propriété'
                : 'Ajoutez une nouvelle propriété à votre portefeuille'}
            </p>
          </div>
        </div>
        
        {/* Loading State */}
        {isEditMode && isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">
                Chargement de la propriété...
              </p>
              <p className="text-sm text-muted-foreground">
                Récupération des informations
              </p>
            </div>
          </div>
        ) : (
          agencyAllowed === false ? (
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-destructive">Accès refusé</CardTitle>
                <CardDescription>
                  Vous ne pouvez pas créer de propriété pour cette agence.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <Button variant="outline" onClick={handleNavigateBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'agence
                </Button>
              </div>
            </Card>
          ) : (
          <CreatePropertyForm 
            formData={formData}
            setFormData={setFormData}
            propertyId={propertyId}
            agencyId={agencyId}
            onSuccess={handleNavigateBack}
          />
          )
        )}
      </div>
    </div>
  );
}
