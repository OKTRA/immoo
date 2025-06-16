
import { supabase } from '@/integrations/supabase/client';

export interface AgencyModerationResult {
  success: boolean;
  error?: string;
}

/**
 * Suspend une agence (la rend inactive)
 */
export const suspendAgency = async (agencyId: string): Promise<AgencyModerationResult> => {
  try {
    const { error } = await supabase
      .from('agencies')
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error suspending agency:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Réactive une agence suspendue
 */
export const reactivateAgency = async (agencyId: string): Promise<AgencyModerationResult> => {
  try {
    const { error } = await supabase
      .from('agencies')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error reactivating agency:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle la visibilité d'une agence
 */
export const toggleAgencyVisibility = async (agencyId: string, isCurrentlyVisible: boolean): Promise<AgencyModerationResult> => {
  try {
    const { error } = await supabase
      .from('agencies')
      .update({ 
        is_visible: !isCurrentlyVisible,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling agency visibility:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle la vérification d'une agence
 */
export const toggleAgencyVerification = async (agencyId: string, newVerificationStatus: boolean): Promise<AgencyModerationResult> => {
  try {
    const { error } = await supabase
      .from('agencies')
      .update({ 
        verified: newVerificationStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling agency verification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour le rating d'une agence
 */
export const updateAgencyRating = async (agencyId: string, rating: number): Promise<AgencyModerationResult> => {
  try {
    // Valider que le rating est entre 0 et 5
    if (rating < 0 || rating > 5) {
      return { success: false, error: 'Le rating doit être entre 0 et 5' };
    }

    const { error } = await supabase
      .from('agencies')
      .update({ 
        rating: rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', agencyId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating agency rating:', error);
    return { success: false, error: error.message };
  }
};

export const agencyModerationService = {
  suspendAgency,
  reactivateAgency,
  toggleAgencyVisibility,
  toggleAgencyVerification,
  updateAgencyRating
};
