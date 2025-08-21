import { supabase } from '@/lib/supabase';
import { Agency } from '@/assets/types';
import { transformAgencyData } from './agencyBasicService';
import { checkUserResourceLimit } from '@/services/subscription/limit';

/**
 * Create a new agency
 */
export const createAgency = async (agencyData: Omit<Agency, 'id'>) => {
  try {
    // Get current user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }
    
    // Guard: verify user's plan allows creating another agency
    const limit = await checkUserResourceLimit(userId, 'agencies');
    if (!limit.allowed) {
      const max = limit.maxAllowed === -1 ? 'illimité' : String(limit.maxAllowed);
      throw new Error(
        `Limite atteinte: votre plan (${limit.planName || 'actuel'}) autorise ${max} agence(s). ` +
        `Veuillez mettre à niveau votre abonnement pour créer une autre agence.`
      );
    }
    
    console.log('Creating agency with data:', agencyData);
    
    const { data, error } = await supabase
      .from('agencies')
      .insert([{
        name: agencyData.name,
        logo_url: agencyData.logoUrl,
        location: agencyData.location,
        properties_count: agencyData.properties,
        rating: agencyData.rating,
        verified: agencyData.verified,
        description: agencyData.description,
        email: agencyData.email,
        phone: agencyData.phone,
        website: agencyData.website,
        specialties: agencyData.specialties,
        service_areas: agencyData.serviceAreas,
        user_id: userId // Important: lier l'agence à l'utilisateur actuel
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating agency:', error);
      throw error;
    }
    
    const agency = transformAgencyData(data);
    
    return { agency, error: null };
  } catch (error: any) {
    console.error('Error creating agency:', error);
    return { agency: null, error: error.message };
  }
};

/**
 * Update an existing agency
 */
export const updateAgency = async (id: string, agencyData: Partial<Agency>) => {
  try {
    console.log('Updating agency with ID', id, 'and data:', agencyData);
    
    const updateData: any = {};
    if (agencyData.name !== undefined) updateData.name = agencyData.name;
    if (agencyData.logoUrl !== undefined) updateData.logo_url = agencyData.logoUrl;
    if (agencyData.location !== undefined) updateData.location = agencyData.location;
    if (agencyData.properties !== undefined) updateData.properties_count = agencyData.properties;
    if (agencyData.rating !== undefined) updateData.rating = agencyData.rating;
    if (agencyData.verified !== undefined) updateData.verified = agencyData.verified;
    if (agencyData.description !== undefined) updateData.description = agencyData.description;
    if (agencyData.email !== undefined) updateData.email = agencyData.email;
    if (agencyData.phone !== undefined) updateData.phone = agencyData.phone;
    if (agencyData.website !== undefined) updateData.website = agencyData.website;
    if (agencyData.specialties !== undefined) updateData.specialties = agencyData.specialties;
    if (agencyData.serviceAreas !== undefined) updateData.service_areas = agencyData.serviceAreas;

    const { data, error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agency:', error);
      throw error;
    }
    
    const agency = transformAgencyData(data);
    
    return { agency, error: null };
  } catch (error: any) {
    console.error(`Error updating agency with ID ${id}:`, error);
    return { agency: null, error: error.message };
  }
};

/**
 * Delete an agency
 */
export const deleteAgency = async (id: string) => {
  try {
    // Get current user ID to ensure ownership
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }

    // Check if the agency belongs to the current user
    const { data: agency, error: fetchError } = await supabase
      .from('agencies')
      .select('id, name, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Agence non trouvée: ${fetchError.message}`);
    }

    if (agency.user_id !== userId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette agence");
    }

    // Before deletion, check if there are profiles linked to this agency
    const { data: linkedProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('agency_id', id);

    if (profileError) {
      console.warn('Error checking linked profiles:', profileError);
      // Continue with deletion anyway
    }

    // Delete the agency
    // The profiles.agency_id will be automatically set to NULL if the constraint is properly configured
    const { error } = await supabase
      .from('agencies')
      .delete()
      .eq('id', id);

    if (error) {
      // Handle specific foreign key constraint error
      if (error.message.includes('profiles_agency_id_fkey')) {
        throw new Error(
          "Impossible de supprimer l'agence car elle est encore liée à des profils utilisateur. " +
          "Veuillez exécuter le script 'fix-agency-profile-relation.sql' pour corriger les contraintes de base de données."
        );
      }
      throw error;
    }

    console.log(`Agency ${agency.name} deleted successfully. ${linkedProfiles?.length || 0} profiles were automatically unlinked.`);
    
    return { 
      success: true, 
      error: null,
      message: `Agence "${agency.name}" supprimée avec succès`,
      affectedProfiles: linkedProfiles?.length || 0
    };
  } catch (error: any) {
    console.error(`Error deleting agency with ID ${id}:`, error);
    return { 
      success: false, 
      error: error.message,
      helpText: error.message.includes('profiles_agency_id_fkey') 
        ? "Exécutez le script SQL 'fix-agency-profile-relation.sql' pour résoudre ce problème"
        : undefined
    };
  }
};
