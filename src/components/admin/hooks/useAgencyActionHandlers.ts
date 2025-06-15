
import { useState } from 'react';
import { toast } from 'sonner';
import { Agency } from '@/hooks/useAgenciesManagement';

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
      toast.success('Agence suspendue avec succès');
      onAgencyUpdate();
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
      toast.success('Agence réactivée avec succès');
      onAgencyUpdate();
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
      toast.success('Visibilité de l\'agence modifiée avec succès');
      onAgencyUpdate();
    } catch (error) {
      console.error('Error toggling agency visibility:', error);
      toast.error('Erreur lors de la modification de la visibilité');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVerification = async () => {
    setIsProcessing(true);
    try {
      // Use the toggleVerification from useAgenciesManagement
      const { toggleVerification } = require('@/hooks/useAgenciesManagement');
      await toggleVerification(agency.id, agency.verified);
      onAgencyUpdate();
    } catch (error) {
      console.error('Error toggling agency verification:', error);
      toast.error('Erreur lors de la modification de la vérification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    setIsProcessing(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('agencies')
        .update({ 
          rating: newRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', agency.id);
      
      if (error) throw error;
      
      toast.success('Évaluation mise à jour avec succès');
      onAgencyUpdate();
    } catch (error) {
      console.error('Error updating agency rating:', error);
      toast.error('Erreur lors de la mise à jour de l\'évaluation');
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
    handleToggleVerification,
    handleUpdateRating,
    handleDelete,
    handleEdit
  };
}
