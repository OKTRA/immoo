
import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Property } from '@/assets/types';

// Re-export all property service functions for backward compatibility
export * from './property/propertyQueries';
export * from './property/propertyMutations';
export * from './property/propertyOwners';
export * from './property/propertyMedia';

// Export agency-specific property functions
export { getPropertiesByAgencyId } from './agency/agencyPropertiesService';

/**
 * Get featured properties for homepage - FIXED VERSION
 */
export const getFeaturedProperties = async (limit: number = 6) => {
  try {
    console.log("Fetching featured properties...");

    // Récupérer les propriétés avec leurs agences
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        agency:agencies(
          id,
          name,
          logo_url,
          email,
          phone,
          website,
          verified,
          description,
          specialties,
          service_areas,
          properties_count,
          rating,
          created_at
        )
      `)
      .eq('status', 'available')
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la récupération des propriétés:', error);
      throw error;
    }

    console.log(`Propriétés récupérées: ${data?.length || 0}`);
    console.log('Données des propriétés:', data);

    // Transformer les données au format attendu
    const properties = data?.map(property => {
      const formatted = {
        id: property.id,
        title: property.title,
        type: property.type,
        location: property.location || '',
        price: property.price || 0,
        area: property.area || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        imageUrl: property.image_url,
        description: property.description,
        features: property.features || [],
        status: property.status || 'available',
        agencyId: property.agency_id,
        ownerId: property.owner_id,
        createdAt: property.created_at,
        updatedAt: property.updated_at
      };

      // Ajouter les informations de l'agence si disponibles
      if (property.agency) {
        formatted.agencyName = property.agency.name;
        formatted.agencyLogo = property.agency.logo_url;
        formatted.agencyPhone = property.agency.phone;
        formatted.agencyEmail = property.agency.email;
        formatted.agencyWebsite = property.agency.website;
        formatted.agencyVerified = property.agency.verified;
        formatted.agencyRating = typeof property.agency.rating === 'number' ? property.agency.rating : 0;
        formatted.agencyDescription = property.agency.description;
        formatted.agencySpecialties = property.agency.specialties || [];
        formatted.agencyServiceAreas = property.agency.service_areas || [];
        formatted.agencyPropertiesCount = property.agency.properties_count || 0;
        
        // Calculer les années d'activité
        if (property.agency.created_at) {
          const createdDate = new Date(property.agency.created_at);
          const currentDate = new Date();
          const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
          formatted.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
        }
        
        formatted.agencyJoinDate = property.agency.created_at;
      }
      
      return formatted;
    }) || [];

    console.log('Propriétés formatées finales:', properties);
    
    return { properties, error: null };
  } catch (error: any) {
    console.error('Erreur dans getFeaturedProperties:', error);
    // Utiliser les données mockées en cas d'erreur
    const mockData = getMockData('properties', limit);
    return { properties: mockData, error: error.message };
  }
};

// Fonction générale pour obtenir les propriétés
export const getProperties = async (agencyId?: string, limit?: number) => {
  if (!agencyId && limit) {
    // Si pas d'agence spécifiée mais une limite, utiliser getFeaturedProperties
    return getFeaturedProperties(limit);
  }

  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        agency:agencies(
          id,
          name,
          logo_url,
          email,
          phone,
          website,
          verified,
          description,
          specialties,
          service_areas,
          properties_count,
          rating,
          created_at
        )
      `);
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformer les données au format attendu
    const properties = data?.map(property => ({
      id: property.id,
      title: property.title,
      type: property.type,
      location: property.location || '',
      price: property.price || 0,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      imageUrl: property.image_url,
      description: property.description,
      features: property.features || [],
      status: property.status || 'available',
      agencyId: property.agency_id,
      ownerId: property.owner_id,
      createdAt: property.created_at,
      updatedAt: property.updated_at
    })) || [];
    
    return { properties, error: null };
  } catch (error: any) {
    console.error('Erreur dans getProperties:', error);
    const mockData = getMockData('properties', limit || 50);
    return { properties: mockData, error: error.message };
  }
};
