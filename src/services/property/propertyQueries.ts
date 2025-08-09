import { supabase } from '@/lib/supabase';
import { Property } from '@/assets/types';
import { formatPropertyFromDb } from './propertyUtils';

// Function to get properties with optional filtering by agency and limit
export const getProperties = async (agencyId?: string, limit?: number) => {
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
      `)
      .eq('is_visible', true); // Only show visible properties in public views
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const properties = data.map(property => {
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
    
    return { properties, error: null };
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return { properties: [], error: error.message };
  }
};

export const getPropertiesByAgencyId = async (agencyId: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, location, agency_id, created_at, updated_at')
      .eq('agency_id', agencyId)
      .order('title', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

// Function to get featured properties for homepage
export const getFeaturedProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

export const getPopularProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

export const getPropertyById = async (propertyId: string) => {
  try {
    // Primary attempt: include is_visible filter for modern schema
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
      `)
      .eq('id', propertyId)
      .eq('is_visible', true);

    let { data, error } = await query.single();

    // Fallback for environments without is_visible column
    if (error && (error as any).code === '42703') {
      const fallback = await supabase
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
        `)
        .eq('id', propertyId)
        .single();
      data = fallback.data as any;
      error = fallback.error as any;
    }

    if (error) throw error;
    
    // Get active leases to determine real status
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select('id, status')
      .eq('property_id', propertyId)
      .eq('status', 'active');
      
    if (leaseError) {
      console.error('Error checking leases:', leaseError);
    }
    
    const hasActiveLeases = leases && leases.length > 0;
    
    if (hasActiveLeases && data.status === 'available') {
      data.status = 'rented';
    }
    
    const property = formatPropertyFromDb(data);
    
    // Add images to the property
    if (data.property_images && data.property_images.length > 0) {
      property.images = data.property_images.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        description: img.description,
        is_primary: img.is_primary,
        position: img.position
      }));
    }
    
    // Add complete agency information
    if (data.agency) {
      property.agencyName = data.agency.name;
      property.agencyLogo = data.agency.logo_url;
      property.agencyPhone = data.agency.phone;
      property.agencyEmail = data.agency.email;
      property.agencyWebsite = data.agency.website;
      property.agencyVerified = data.agency.verified;
      property.agencyRating = typeof data.agency.rating === 'number' ? data.agency.rating : 0;
      property.agencyDescription = data.agency.description;
      property.agencySpecialties = data.agency.specialties || [];
      property.agencyServiceAreas = data.agency.service_areas || [];
      property.agencyPropertiesCount = data.agency.properties_count || 0;
      
      // Calculate years active from creation date
      if (data.agency.created_at) {
        const createdDate = new Date(data.agency.created_at);
        const currentDate = new Date();
        const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
        property.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
      }
      
      property.agencyJoinDate = data.agency.created_at;
    }
    
    return { property, error: null, hasActiveLeases };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return { property: null, error: error.message, hasActiveLeases: false };
  }
};

// Special version for editing that includes hidden properties and additional data
export const getPropertyByIdForEdit = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners!owner_id(
          id,
          user_id,
          company_name,
          tax_id,
          payment_method,
          payment_percentage
        ),
        agency:agencies!agency_id(
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
      `)
      .eq('id', propertyId)
      // Don't filter by is_visible for editing
      .single();
    
    if (error) throw error;
    
    const property = formatPropertyFromDb(data);
    
    // Add images to the property for editing
    if (data.property_images && data.property_images.length > 0) {
      property.images = data.property_images.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        description: img.description,
        is_primary: img.is_primary,
        position: img.position
      }));
      
      // Also prepare additionalImages format for the media form
      property.additionalImages = data.property_images
        .filter((img: any) => !img.is_primary)
        .map((img: any) => ({
          url: img.image_url,
          isPrimary: img.is_primary,
          description: img.description || ''
        }));
    }
    
    // Add complete agency information
    if (data.agency) {
      property.agencyName = data.agency.name;
      property.agencyLogo = data.agency.logo_url;
      property.agencyPhone = data.agency.phone;
      property.agencyEmail = data.agency.email;
      property.agencyWebsite = data.agency.website;
      property.agencyVerified = data.agency.verified;
      property.agencyRating = typeof data.agency.rating === 'number' ? data.agency.rating : 0;
      property.agencyDescription = data.agency.description;
      property.agencySpecialties = data.agency.specialties || [];
      property.agencyServiceAreas = data.agency.service_areas || [];
      property.agencyPropertiesCount = data.agency.properties_count || 0;
      
      // Calculate years active from creation date
      if (data.agency.created_at) {
        const createdDate = new Date(data.agency.created_at);
        const currentDate = new Date();
        const yearsDiff = currentDate.getFullYear() - createdDate.getFullYear();
        property.agencyYearsActive = yearsDiff > 0 ? yearsDiff : 1;
      }
      
      property.agencyJoinDate = data.agency.created_at;
    }

    // Add property owner information
    if (data.owner) {
      property.ownerInfo = {
        ownerId: data.owner.id
      };
      // Add additional owner fields directly to property
      property.ownerCompanyName = data.owner.company_name;
      property.ownerTaxId = data.owner.tax_id;
      property.ownerPaymentMethod = data.owner.payment_method;
      property.ownerPaymentPercentage = data.owner.payment_percentage;
    }
    
    return { property, error: null };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId} for edit:`, error);
    return { property: null, error: error.message };
  }
};
