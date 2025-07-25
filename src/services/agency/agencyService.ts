import { supabase } from '@/lib/supabase';
import { Agency } from '@/assets/types';

export class AgencyService {
  static async getAllAgencies(): Promise<Agency[]> {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching agencies:', error);
      return [];
    }
  }

  static async getAgencyById(id: string): Promise<Agency | null> {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching agency:', error);
      return null;
    }
  }

  static async getAgenciesByLocation(location: string): Promise<Agency[]> {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', true)
        .ilike('location', `%${location}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching agencies by location:', error);
      return [];
    }
  }

  static async searchAgencies(query: string): Promise<Agency[]> {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching agencies:', error);
      return [];
    }
  }

  static async updateAgency(id: string, updates: Partial<Agency>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agencies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating agency:', error);
      return false;
    }
  }

  static async createAgency(agency: Omit<Agency, 'id' | 'created_at' | 'updated_at'>): Promise<Agency | null> {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .insert(agency)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating agency:', error);
      return null;
    }
  }

  static async deleteAgency(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting agency:', error);
      return false;
    }
  }
}
