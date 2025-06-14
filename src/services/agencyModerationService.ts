
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const agencyModerationService = {
  /**
   * Hide/Show an agency
   */
  async toggleAgencyVisibility(agencyId: string, isVisible: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ 
          verified: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling agency visibility:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Suspend an agency account
   */
  async suspendAgency(agencyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update agency status
      const { error: agencyError } = await supabase
        .from('agencies')
        .update({ 
          verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId);
      
      if (agencyError) throw agencyError;

      // Update all properties of this agency to unavailable
      const { error: propertiesError } = await supabase
        .from('properties')
        .update({ 
          status: 'unavailable',
          updated_at: new Date().toISOString()
        })
        .eq('agency_id', agencyId);
      
      if (propertiesError) {
        console.warn('Error updating properties status:', propertiesError);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error suspending agency:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reactivate an agency account
   */
  async reactivateAgency(agencyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ 
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error reactivating agency:', error);
      return { success: false, error: error.message };
    }
  }
};
