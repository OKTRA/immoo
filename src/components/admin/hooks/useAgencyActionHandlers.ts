
import { useState } from 'react';
import { toast } from 'sonner';
import { Agency } from '@/hooks/useAgenciesManagement';
import { agencyModerationService } from '@/services/agencyModerationService';

interface UseAgencyActionHandlersProps {
  agency: Agency;
  onAgencyUpdate: () => void;
  onAgencyDelete: (agencyId: string) => void;
}

export function useAgencyActionHandlers({
  agency,
  onAgencyUpdate,
  onAgencyDelete
}: UseAgencyActionHandlersProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuspendAgency = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await agencyModerationService.suspendAgency(agency.id);
      if (!success) {
        throw new Error(error || 'Erreur lors de la suspension');
      }
      toast.success('Agence suspendue avec succès');
      onAgencyUpdate();
    } catch (error: any) {
      console.error('Error suspending agency:', error);
      toast.error(error.message || 'Erreur lors de la suspension de l\'agence');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateAgency = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await agencyModerationService.reactivateAgency(agency.id);
      if (!success) {
        throw new Error(error || 'Erreur lors de la réactivation');
      }
      toast.success('Agence réactivée avec succès');
      onAgencyUpdate();
    } catch (error: any) {
      console.error('Error reactivating agency:', error);
      toast.error(error.message || 'Erreur lors de la réactivation de l\'agence');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVisibility = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await agencyModerationService.toggleAgencyVisibility(
        agency.id, 
        agency.is_visible !== false
      );
      if (!success) {
        throw new Error(error || 'Erreur lors de la modification de la visibilité');
      }
      toast.success('Visibilité de l\'agence modifiée avec succès');
      onAgencyUpdate();
    } catch (error: any) {
      console.error('Error toggling agency visibility:', error);
      toast.error(error.message || 'Erreur lors de la modification de la visibilité');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await agencyModerationService.toggleAgencyVerification(
        agency.id, 
        !agency.verified
      );
      if (!success) {
        throw new Error(error || 'Erreur lors de la modification de la vérification');
      }
      toast.success(
        !agency.verified 
          ? 'Agence vérifiée avec succès' 
          : 'Vérification de l\'agence retirée'
      );
      onAgencyUpdate();
    } catch (error: any) {
      console.error('Error toggling agency verification:', error);
      toast.error(error.message || 'Erreur lors de la modification de la vérification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    setIsProcessing(true);
    try {
      const { success, error } = await agencyModerationService.updateAgencyRating(agency.id, newRating);
      if (!success) {
        throw new Error(error || 'Erreur lors de la mise à jour de l\'évaluation');
      }
      toast.success('Évaluation mise à jour avec succès');
      onAgencyUpdate();
    } catch (error: any) {
      console.error('Error updating agency rating:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'évaluation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    onAgencyDelete(agency.id);
  };

  const handleEdit = async (updates: Partial<Agency>) => {
    setIsProcessing(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('agencies')
        .update({
          name: updates.name,
          location: updates.location,
          email: updates.email,
          phone: updates.phone,
          website: updates.website,
          description: updates.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', agency.id);
      
      if (error) throw error;
      
      onAgencyUpdate();
      toast.success('Agence mise à jour avec succès');
    } catch (error: any) {
      console.error('Error updating agency:', error);
      toast.error('Erreur lors de la mise à jour de l\'agence');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleSuspendAgency,
    handleReactivateAgency,
    handleToggleVisibility,
    handleToggleVerification,
    handleUpdateRating,
    handleDelete,
    handleEdit
  };
}
