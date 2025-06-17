import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Agency } from '@/assets/types';

/**
 * Get all agencies with pagination - PUBLIC VERSION for browsing
 */
export const getAllAgencies = async (
  limit = 10,
  offset = 0,
  sortBy = 'properties_count',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    console.log("🏢 Fetching public agencies for browsing...", { limit, offset, sortBy, sortOrder });

    // For public browsing, we don't filter by user_id - we want to show all agencies
    const { data, error, count } = await supabase
      .from('agencies_with_property_count')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .eq('is_visible', true)
      .order(sortBy === 'properties_count' ? 'computed_properties_count' : sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }
    
    console.log(`✅ Raw data from Supabase:`, { count, dataLength: data?.length, data });
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No agencies found in database with current filters');
      return { agencies: [], count: 0, error: null };
    }
    
    const transformedData = data?.map((item) => {
      console.log('🔄 Transforming agency:', item);
      const transformed = transformAgencyData(item);
      console.log('✅ Transformed result:', transformed);
      return transformed;
    });
    
    console.log(`✅ Final transformed agencies:`, transformedData);
    
    return { agencies: transformedData || [], count, error: null };
  } catch (error: any) {
    console.error('❌ Error getting public agencies:', error);
    // Utiliser les données mockées si la requête échoue
    const mockData = getMockData('agencies', limit);
    console.log('🔄 Using mock data:', mockData);
    return { agencies: mockData, count: mockData.length, error: error.message };
  }
};

/**
 * Get user's own agencies with pagination - USER VERSION for management
 */
export const getUserAgencies = async (
  limit = 10,
  offset = 0,
  sortBy = 'properties_count',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    // Vérifier la session utilisateur pour le debugging
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    console.log("Session utilisateur:", userId ? `Connecté (${userId})` : "Non connecté");

    if (!userId) {
      throw new Error("Utilisateur non connecté");
    }

    // Récupérer uniquement les agences de l'utilisateur connecté
    const { data, error, count } = await supabase
      .from('agencies_with_property_count')
      .select('*', { count: 'exact' })
      .eq('user_id', userId) // Filtrer explicitement par l'ID utilisateur actuel
      .order(sortBy === 'properties_count' ? 'computed_properties_count' : sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    console.log(`Agences utilisateur récupérées: ${data?.length || 0}`);
    
    const transformedData = data?.map((item) => transformAgencyData(item));
    
    return { agencies: transformedData, count, error: null };
  } catch (error: any) {
    console.error('Error getting user agencies:', error);
    // Utiliser les données mockées si la requête échoue
    const mockData = getMockData('agencies', limit);
    return { agencies: mockData, count: mockData.length, error: error.message };
  }
};

/**
 * Get an agency by ID
 */
export const getAgencyById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('agencies_with_property_count')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .eq('is_visible', true)
      .single();

    if (error) throw error;
    
    const agency = transformAgencyData(data);
    
    return { agency, error: null };
  } catch (error: any) {
    console.error(`Error getting agency with ID ${id}:`, error);
    return { agency: null, error: error.message };
  }
};

/**
 * Get featured agencies
 */
export const getFeaturedAgencies = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('agencies_with_property_count')
      .select('*')
      .eq('status', 'active')
      .eq('is_visible', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    const agencies = data.map((item) => transformAgencyData(item));
    
    return { agencies, error: null };
  } catch (error: any) {
    console.error('Error getting featured agencies:', error);
    const mockData = getMockData('agencies', limit);
    return { agencies: mockData, error: error.message };
  }
};

/**
 * Fonction utilitaire pour transformer les données d'agence du format de la base de données au format de l'application
 */
export const transformAgencyData = (data: any, useFallbackValues = false): Agency => {
  // Ensure rating is always a number
  const rating = typeof data.rating === 'number' ? data.rating : 
                 typeof data.rating === 'string' ? parseFloat(data.rating) || 0 : 0;

  return {
    id: data.id,
    name: data.name,
    logoUrl: data.logo_url || (useFallbackValues ? '' : data.logo_url),
    location: data.location || (useFallbackValues ? '' : data.location),
    properties: data.computed_properties_count ?? data.properties_count ?? (useFallbackValues ? 0 : data.properties_count),
    rating: rating,
    verified: data.verified || false,
    description: data.description || (useFallbackValues ? '' : data.description),
    email: data.email || (useFallbackValues ? '' : data.email),
    phone: data.phone || (useFallbackValues ? '' : data.phone),
    website: data.website || (useFallbackValues ? '' : data.website),
    specialties: data.specialties || (useFallbackValues ? [] : data.specialties),
    serviceAreas: data.service_areas || (useFallbackValues ? [] : data.service_areas),
  };
};
