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
    
    // Direct two-step fetch (avoids embedded join 400s if schema cache misses relationships)
    const { data: props, error: propsError } = await supabase
      .from('properties')
      .select('id, title, agency_id')
      .eq('agency_id', agencyId);
    if (propsError) throw propsError;
    const propertyIds = (props || []).map(p => p.id);
    if (propertyIds.length === 0) return { leases: [], error: null };

    const { data: rawLeases, error: rawLeasesError } = await supabase
      .from('leases')
      .select('*')
      .in('property_id', propertyIds);
    if (rawLeasesError) throw rawLeasesError;

    // Hydrate properties for display (title, location, etc.)
    const propertyById: Record<string, any> = {};
    for (const p of props || []) {
      propertyById[p.id] = p;
    }

    // Fetch tenants for these leases to populate names in UI
    const tenantIds = Array.from(new Set((rawLeases || []).map(l => l.tenant_id).filter(Boolean)));
    let tenantById: Record<string, any> = {};
    if (tenantIds.length > 0) {
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, first_name, last_name, email, phone, profession')
        .in('id', tenantIds as string[]);
      if (tenantsError) throw tenantsError;
      for (const t of tenantsData || []) tenantById[t.id] = t;
    }

    // Shape leases with embedded structures expected by UI (leases.properties, leases.tenants)
    const leases = (rawLeases || []).map(l => ({
      ...l,
      properties: propertyById[l.property_id] || null,
      tenants: l.tenant_id ? tenantById[l.tenant_id] || null : null,
    }));

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
