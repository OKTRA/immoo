import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CreateAgencyProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  agency_name: string;
}

export interface AgencyProfileResult {
  success: boolean;
  error: string | null;
  profile?: any;
  agency?: any;
}

export const createAgencyProfileForGoogleUser = async (
  userData: CreateAgencyProfileData
): Promise<AgencyProfileResult> => {
  try {
    console.log('🔐 Creating agency profile for Google user:', userData.email);

    // Récupérer l'utilisateur actuel
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return {
        success: false,
        error: 'Erreur lors de la récupération de l\'utilisateur connecté',
      };
    }

    // 1. Créer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        role: 'agency',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return {
        success: false,
        error: `Erreur lors de la création du profil: ${profileError.message}`,
      };
    }

    // 2. Créer l'agence
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name: userData.agency_name,
        owner_id: profile.id,
        email: userData.email,
        phone: userData.phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (agencyError) {
      console.error('Error creating agency:', agencyError);
      // Supprimer le profil créé en cas d'erreur
      await supabase.from('profiles').delete().eq('id', profile.id);
      
      return {
        success: false,
        error: `Erreur lors de la création de l'agence: ${agencyError.message}`,
      };
    }

    // 3. Mettre à jour le profil avec l'ID de l'agence
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ agency_id: agency.id })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile with agency_id:', updateError);
      // Nettoyer en cas d'erreur
      await supabase.from('agencies').delete().eq('id', agency.id);
      await supabase.from('profiles').delete().eq('id', profile.id);
      
      return {
        success: false,
        error: `Erreur lors de la mise à jour du profil: ${updateError.message}`,
      };
    }

    console.log('✅ Agency profile created successfully');
    return {
      success: true,
      error: null,
      profile,
      agency,
    };
  } catch (error: any) {
    console.error('Unexpected error creating agency profile:', error);
    return {
      success: false,
      error: error.message || 'Une erreur inattendue s\'est produite',
    };
  }
};

export const getAgencyProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        agencies (*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return { profile: data, error: null };
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const updateAgencyProfile = async (
  userId: string,
  updates: Partial<CreateAgencyProfileData>
) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { profile: data, error: null };
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const checkAgencyExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if agency exists:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if agency exists:', error);
    return false;
  }
};
