
import { supabase } from '@/lib/supabase';
import { Property } from '@/assets/types';
import { formatPropertyFromDb } from '../property/propertyUtils';

/**
 * Get properties by agency ID - for public viewing (only visible properties)
 */
export const getPublicPropertiesByAgencyId = async (agencyId: string, limit?: number) => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(
          id,
          user_id,
          company_name,
          tax_id,
          payment_method,
          payment_percentage
        ),
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
        ),
        property_images(
          id,
          image_url,
          description,
          is_primary,
          position
        )
      `, { count: 'exact' })
      .eq('agency_id', agencyId)
      .eq('is_visible', true) // Only show visible properties in public views
      .eq('status', 'available'); // Only show available properties
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const properties = data?.map(property => {
      const formatted = formatPropertyFromDb(property);
      
      // Add images to the property
      if (property.property_images && property.property_images.length > 0) {
        formatted.images = property.property_images.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          description: img.description,
          is_primary: img.is_primary,
          position: img.position
        }));
      }
      
      // Add complete agency information to each property
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
        
        // Calculate years active from creation date
        if (property.agency.created_at) {
          const createdDate = new Date(property.agency.created_at);
          const currentDate = new Date();
          const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
          formatted.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
        }
        
        formatted.agencyJoinDate = property.agency.created_at;
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
      .from('properties')
      .select(`
        *,
        owner:property_owners(
          id,
          user_id,
          company_name,
          tax_id,
          payment_method,
          payment_percentage
        ),
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
        ),
        property_images(
          id,
          image_url,
          description,
          is_primary,
          position
        )
      `, { count: 'exact' })
      .eq('agency_id', agencyId);
      // Note: For agency management, we show ALL properties (visible and hidden)
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const properties = data?.map(property => {
      const formatted = formatPropertyFromDb(property);
      
      // Add images to the property
      if (property.property_images && property.property_images.length > 0) {
        formatted.images = property.property_images.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          description: img.description,
          is_primary: img.is_primary,
          position: img.position
        }));
      }
      
      // Add complete agency information to each property
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
        
        // Calculate years active from creation date
        if (property.agency.created_at) {
          const createdDate = new Date(property.agency.created_at);
          const currentDate = new Date();
          const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
          formatted.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
        }
        
        formatted.agencyJoinDate = property.agency.created_at;
      }
      
      return formatted;
    });
    
    return { properties, count: count || 0, error: null };
  } catch (error: any) {
    console.error(`Error fetching properties for agency ${agencyId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};
