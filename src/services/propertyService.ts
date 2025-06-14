
import { supabase } from '@/lib/supabase';
import { Property } from '@/assets/types';

// Function to format property data from database
const formatPropertyFromDb = (dbProperty: any): Property => {
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    type: dbProperty.type,
    price: dbProperty.price,
    location: dbProperty.location,
    area: dbProperty.area,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    features: dbProperty.features || [],
    imageUrl: dbProperty.image_url,
    description: dbProperty.description,
    status: dbProperty.status,
    agencyId: dbProperty.agency_id,
    agencyName: dbProperty.agency?.name,
    agencyLogo: dbProperty.agency?.logo_url,
    agencyPhone: dbProperty.agency?.phone,
    agencyEmail: dbProperty.agency?.email,
    agencyWebsite: dbProperty.agency?.website,
    agencyVerified: dbProperty.agency?.verified || false,
    agencyRating: typeof dbProperty.agency?.rating === 'number' ? dbProperty.agency.rating : 0,
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at
  };
};

// Function to get properties with optional filtering by agency and limit
export const getProperties = async (agencyId?: string, limit?: number) => {
  try {
    console.log('Fetching properties...', { agencyId, limit });
    
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
          rating
        )
      `);
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
    
    console.log('Properties fetched successfully:', data);
    
    const properties = data?.map(formatPropertyFromDb) || [];
    
    return { properties, error: null };
  } catch (error: any) {
    console.error('Error in getProperties:', error);
    return { properties: [], error: error.message };
  }
};

// Function to get properties by agency ID
export const getPropertiesByAgencyId = async (agencyId: string, status?: string) => {
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
          rating
        )
      `)
      .eq('agency_id', agencyId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const properties = data?.map(formatPropertyFromDb) || [];
    
    return { properties, error: null };
  } catch (error: any) {
    console.error(`Error fetching properties for agency ${agencyId}:`, error);
    return { properties: [], error: error.message };
  }
};

// Function to get featured properties for homepage
export const getFeaturedProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

// Function to get a single property by ID
export const getPropertyById = async (propertyId: string) => {
  try {
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
          rating
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    
    const property = formatPropertyFromDb(data);
    
    return { property, error: null };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return { property: null, error: error.message };
  }
};
