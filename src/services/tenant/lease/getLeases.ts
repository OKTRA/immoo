import { supabase } from '@/lib/supabase';

/**
 * Get leases for a property
 */
export const getLeasesByPropertyId = async (propertyId: string) => {
  try {
    console.log(`Fetching leases for property: ${propertyId}`);
    
    // Vérifier d'abord si la propriété existe
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('id, agency_id')
      .eq('id', propertyId)
      .single();
      
    if (propertyError) {
      console.error('Error checking property:', propertyError);
      throw propertyError;
    }
    
    if (!propertyData) {
      console.error('Property not found');
      return { leases: [], error: "Property not found" };
    }
    
    console.log('Property data:', propertyData);
    
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          first_name,
          last_name
        ),
        properties:property_id (
          title,
          location
        )
      `)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error fetching leases:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leases for property ${propertyId}`);
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for property ${propertyId}:`, error);
    return { leases: [], error: error.message };
  }
};

/**
 * Get leases for an agency
 */
export const getLeasesByAgencyId = async (agencyId: string) => {
  try {
    console.log(`Fetching leases for agency: ${agencyId}`);
    
    // Vérifier d'abord si l'agence existe
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('id', agencyId)
      .maybeSingle();
      
    if (agencyError) {
      console.error('Error checking agency:', agencyError);
      throw agencyError;
    }
    
    if (!agency) {
      console.error(`Agency with ID ${agencyId} not found`);
      return { leases: [], error: "Agency not found" };
    }
    
    console.log('Agency found:', agency);
    
    // Méthode directe: récupérer les baux liés aux propriétés de cette agence
    // Cette requête est beaucoup plus directe et résout le problème de récupération des baux
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select(`
        *,
        properties!inner(
          id, 
          title, 
          agency_id
        ),
        tenants:tenant_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        payments:payments (
          id,
          status,
          amount,
          payment_type
        )
      `)
      .eq('properties.agency_id', agencyId);

    if (leasesError) {
      console.error('Error fetching leases:', leasesError);
      throw leasesError;
    }
    
    console.log(`Found ${leases?.length || 0} leases for agency ${agencyId} with direct query:`, leases);
    return { leases, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for agency ${agencyId}:`, error);
    return { leases: [], error: error.message };
  }
};

/**
 * Get leases by tenant ID
 */
export const getLeasesByTenantId = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('apartment_leases')
      .select(`
        *,
        apartments:apartment_id (
          id,
          unit_number,
          floor_plan,
          bedrooms,
          bathrooms,
          monthly_rent,
          property_id,
          properties:property_id (
            id,
            title,
            location,
            image_url
          )
        )
      `)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for tenant ${tenantId}:`, error);
    return { leases: [], error: error.message };
  }
};
