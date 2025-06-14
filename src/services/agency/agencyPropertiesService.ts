
import { supabase } from '@/lib/supabase';
import { formatPropertyFromDb } from '../property/propertyUtils';

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
        )
      `)
      .eq('agency_id', agencyId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Format properties and enrich with agency data
    const properties = data.map(property => {
      const formatted = formatPropertyFromDb(property);
      
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
    
    return { properties, count, error: null };
  } catch (error: any) {
    console.error(`Error fetching properties for agency ${agencyId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};
