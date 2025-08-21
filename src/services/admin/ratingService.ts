import { supabase } from '@/lib/supabase';

export interface AgencyRating {
  id?: string;
  agency_id: string;
  rating: number;
  comment?: string;
  admin_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyRating {
  id?: string;
  property_id: string;
  rating: number;
  comment?: string;
  admin_id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Créer ou mettre à jour une note d'agence par l'admin
 */
export async function setAgencyRating(
  agencyId: string,
  rating: number,
  adminId: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier si une note existe déjà
    const { data: existingRating } = await supabase
      .from('agency_ratings')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('admin_id', adminId)
      .single();

    if (existingRating) {
      // Mettre à jour la note existante
      const { error } = await supabase
        .from('agency_ratings')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRating.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Créer une nouvelle note
      const { error } = await supabase
        .from('agency_ratings')
        .insert({
          agency_id: agencyId,
          rating,
          comment,
          admin_id: adminId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Obtenir la note moyenne d'une agence
 */
export async function getAgencyAverageRating(agencyId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('agency_ratings')
      .select('rating')
      .eq('agency_id', agencyId);

    if (error) {
      console.warn('Error getting agency average rating:', error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / data.length) * 10) / 10; // Arrondi à 1 décimale
  } catch (error) {
    console.error('Error getting agency average rating:', error);
    return 0;
  }
}

/**
 * Créer ou mettre à jour une note de propriété par l'admin
 */
export async function setPropertyRating(
  propertyId: string,
  rating: number,
  adminId: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  // Temporarily disabled: property_ratings table doesn't exist
  console.log(`setPropertyRating disabled for property ${propertyId} - table doesn't exist`);
  return { success: false, error: "Rating service temporarily disabled" };
}

/**
 * Obtenir la note moyenne d'une propriété
 */
export async function getPropertyAverageRating(propertyId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('property_ratings')
      .select('rating')
      .eq('property_id', propertyId);

    if (error) {
      console.warn('Error getting property average rating:', error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
    return Math.round((totalRating / data.length) * 10) / 10; // Arrondi à 1 décimale
  } catch (error) {
    console.error('Error getting property average rating:', error);
    return 0;
  }
}

/**
 * Obtenir toutes les notes d'une agence avec les détails
 */
export async function getAgencyRatings(agencyId: string): Promise<AgencyRating[]> {
  try {
    const { data, error } = await supabase
      .from('agency_ratings')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error getting agency ratings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting agency ratings:', error);
    return [];
  }
}

/**
 * Obtenir toutes les notes d'une propriété avec les détails
 */
export async function getPropertyRatings(propertyId: string): Promise<PropertyRating[]> {
  // Temporarily disabled: property_ratings table doesn't exist
  console.log(`getPropertyRatings disabled for property ${propertyId} - table doesn't exist`);
  return [];
}