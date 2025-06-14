
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
      const result = await agencyModerationService.suspendAgency(agency.id);
      
      if (result.success) {
        toast.success('Agence suspendue avec succès');
        onAgencyUpdate();
      } else {
        toast.error(result.error || 'Erreur lors de la suspension');
      }
    } catch (error) {
      console.error('Error suspending agency:', error);
      toast.error('Erreur lors de la suspension de l\'agence');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateAgency = async () => {
    setIsProcessing(true);
    try {
      const result = await agencyModerationService.reactivateAgency(agency.id);
      
      if (result.success) {
        toast.success('Agence réactivée avec succès');
        onAgencyUpdate();
      } else {
        toast.error(result.error || 'Erreur lors de la réactivation');
      }
    } catch (error) {
      console.error('Error reactivating agency:', error);
      toast.error('Erreur lors de la réactivation de l\'agence');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVisibility = async () => {
    setIsProcessing(true);
    try {
      const result = await agencyModerationService.toggleAgencyVisibility(
        agency.id, 
        !agency.verified
      );
      
      if (result.success) {
        toast.success(
          agency.verified 
            ? 'Agence masquée avec succès' 
            : 'Agence affichée avec succès'
        );
        onAgencyUpdate();
      } else {
        toast.error(result.error || 'Erreur lors de la modification de la visibilité');
      }
    } catch (error) {
      console.error('Error toggling agency visibility:', error);
      toast.error('Erreur lors de la modification de la visibilité');
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
      // This would be handled by the parent component's update function
      // For now, we'll just call the refresh function
      onAgencyUpdate();
      toast.success('Agence mise à jour avec succès');
    } catch (error) {
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
    handleDelete,
    handleEdit
  };
}
