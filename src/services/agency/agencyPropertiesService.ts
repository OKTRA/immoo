
import { supabase } from '@/lib/supabase';
import { Property } from '@/assets/types';
import { formatPropertyFromDb } from '../property/propertyUtils';

/**
 * Get properties by agency ID - for public viewing (only visible properties)
 */
export const getPublicPropertiesByAgencyId = async (agencyId: string, limit?: number) => {
  try {
    let query = supabase
      .from('properties_complete')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId)
      .eq('is_visible', true)
      .eq('status', 'available');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const properties = data?.map(property => {
      const formatted = formatPropertyFromDb(property);
      
      // Add images to the property (view already embeds images)
      if (property.property_images && property.property_images.length > 0) {
        formatted.images = property.property_images.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          description: img.description,
          is_primary: img.is_primary,
          position: img.position
        }));
      }

      // Add agency info from view columns if present
      if (property.agency_name) {
        formatted.agencyName = property.agency_name;
        formatted.agencyLogo = property.agency_logo;
        formatted.agencyPhone = property.agency_phone;
        formatted.agencyEmail = property.agency_email;
        formatted.agencyWebsite = property.agency_website;
        formatted.agencyVerified = property.agency_verified;
        formatted.agencyRating = typeof property.agency_rating === 'number' ? property.agency_rating : 0;
        formatted.agencyDescription = property.agency_description;
        formatted.agencySpecialties = property.agency_specialties || [];
        formatted.agencyServiceAreas = property.agency_service_areas || [];
        formatted.agencyPropertiesCount = property.agency_properties_count || 0;
        if (property.agency_created_at) {
          const createdDate = new Date(property.agency_created_at);
          const currentDate = new Date();
          const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
          formatted.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
        }
        formatted.agencyJoinDate = property.agency_created_at;
      }
      
      return formatted;
    });
    
    return { properties, count: count || 0, error: null };
  } catch (error: any) {
    console.error(`Error fetching public properties for agency ${agencyId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};

/**
 * Get properties by agency ID - for agency management (all properties including hidden)
 */
export const getPropertiesByAgencyId = async (agencyId: string, status?: string) => {
  try {
    let query = supabase
      .from('properties_complete')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId);
      // For management, show all properties; no is_visible filter
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const properties = data?.map(property => {
      const formatted = formatPropertyFromDb(property);
      
      // Add images to the property (view already embeds images)
      if (property.property_images && property.property_images.length > 0) {
        formatted.images = property.property_images.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          description: img.description,
          is_primary: img.is_primary,
          position: img.position
        }));
      }

      // Add agency info from view columns if present
      if (property.agency_name) {
        formatted.agencyName = property.agency_name;
        formatted.agencyLogo = property.agency_logo;
        formatted.agencyPhone = property.agency_phone;
        formatted.agencyEmail = property.agency_email;
        formatted.agencyWebsite = property.agency_website;
        formatted.agencyVerified = property.agency_verified;
        formatted.agencyRating = typeof property.agency_rating === 'number' ? property.agency_rating : 0;
        formatted.agencyDescription = property.agency_description;
        formatted.agencySpecialties = property.agency_specialties || [];
        formatted.agencyServiceAreas = property.agency_service_areas || [];
        formatted.agencyPropertiesCount = property.agency_properties_count || 0;
        if (property.agency_created_at) {
          const createdDate = new Date(property.agency_created_at);
          const currentDate = new Date();
          const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
          formatted.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
        }
        formatted.agencyJoinDate = property.agency_created_at;
      }
      
      return formatted;
    });
    
    return { properties, count: count || 0, error: null };
  } catch (error: any) {
    console.error(`Error fetching properties for agency ${agencyId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};
