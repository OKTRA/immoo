
import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Agency } from '@/assets/types';

/**
 * Get all agencies with pagination
 */
export const getAllAgencies = async (
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

    // Récupérer uniquement les agences de l'utilisateur connecté
    const { data, error, count } = await supabase
      .from('agencies')
      .select('*', { count: 'exact' })
      .eq('user_id', userId) // Filtrer explicitement par l'ID utilisateur actuel
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    console.log(`Agences récupérées: ${data?.length || 0}`);
    
    const transformedData = data?.map((item) => transformAgencyData(item));
    
    return { agencies: transformedData, count, error: null };
  } catch (error: any) {
    console.error('Error getting agencies:', error);
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
      .from('agencies')
      .select('*')
      .eq('id', id)
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
    // First attempt to fetch from Supabase with verified filter
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      const agencies = data.map((item) => transformAgencyData(item));
      
      return { agencies, error: null };
    } catch (error) {
      // If verified column doesn't exist, try without the filter
      console.warn('Falling back to query without verified filter:', error);
      const { data, error: fallbackError } = await supabase
        .from('agencies')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);

      if (fallbackError) throw fallbackError;
      
      const agencies = data.map((item) => transformAgencyData(item, true));
      
      return { agencies, error: null };
    }
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
  return {
    id: data.id,
    name: data.name,
    logoUrl: data.logo_url || (useFallbackValues ? '' : data.logo_url),
    location: data.location || (useFallbackValues ? '' : data.location),
    properties: data.properties_count || (useFallbackValues ? 0 : data.properties_count),
    rating: data.rating || (useFallbackValues ? 0 : data.rating),
    verified: data.verified || false,
    description: data.description || (useFallbackValues ? '' : data.description),
    email: data.email || (useFallbackValues ? '' : data.email),
    phone: data.phone || (useFallbackValues ? '' : data.phone),
    website: data.website || (useFallbackValues ? '' : data.website),
    specialties: data.specialties || (useFallbackValues ? [] : data.specialties),
    serviceAreas: data.service_areas || (useFallbackValues ? [] : data.service_areas),
  };
};
