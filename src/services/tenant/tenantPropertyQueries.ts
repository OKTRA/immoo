import { supabase } from '@/lib/supabase';

/**
 * Get tenants for a specific property with lease status
 */
export const getTenantsByPropertyId = async (propertyId: string) => {
  try {
    console.log(`Fetching tenants for property: ${propertyId}`);
    
    // Vérifier d'abord si la propriété existe
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('agency_id, title')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      console.error('Error fetching property:', propertyError);
      throw propertyError;
    }
    
    if (!property) {
      console.error('Property not found');
      return { tenants: [], error: "Property not found" };
    }
    
    console.log('Property data:', property);
    const agencyId = property?.agency_id;
    
    if (!agencyId) {
      throw new Error('Property does not have an associated agency');
    }
    
    // Récupérer tous les locataires pour cette agence
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*, leases!leases_tenant_id_fkey(id, property_id, status)')
      .eq('agency_id', agencyId)
      .order('last_name', { ascending: true });

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError);
      throw tenantsError;
    }

    // Afficher les données pour débogage
    console.log(`Found ${allTenants?.length || 0} tenants for agency ${agencyId}`);
    console.log('Tenant data sample:', allTenants?.slice(0, 2));
    
    // Associer les locataires à leurs informations de bail pour cette propriété
    const tenantsWithLeaseInfo = allTenants.map(tenant => {
      // Trouver si ce locataire a un bail pour cette propriété
      const tenantLeases = tenant.leases || [];
      const propertyLease = tenantLeases.find(lease => lease.property_id === propertyId);
      
      return {
        id: tenant.id,
        firstName: tenant.first_name,
        lastName: tenant.last_name,
        email: tenant.email,
        phone: tenant.phone,
        profession: tenant.profession,
        employmentStatus: tenant.employment_status,
        photoUrl: tenant.photo_url,
        identityPhotos: tenant.identity_photos,
        emergencyContact: tenant.emergency_contact,
        hasLease: !!propertyLease,
        leaseId: propertyLease?.id,
        leaseStatus: propertyLease?.status,
        propertyId: propertyLease?.property_id || null,
        createdAt: tenant.created_at
      };
    });

    return { tenants: tenantsWithLeaseInfo, error: null };
  } catch (error: any) {
    console.error('Error getting tenants for property:', error);
    return { tenants: [], error: error.message };
  }
};

/**
 * Get all tenants for a specific agency
 */
export const getTenantsByAgencyId = async (agencyId: string) => {
  try {
    console.log(`Fetching tenants for agency: ${agencyId}`);
    
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
      console.warn(`Agency not found: ${agencyId}`);
      return { tenants: [], error: "Agency not found" };
    } else {
      console.log('Agency found:', agency);
    }
    
    // Utiliser une requête optimisée pour récupérer les locataires avec leurs informations de bail
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases:leases(
          id,
          property_id,
          status
        )
      `)
      .eq('agency_id', agencyId)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
    
    console.log(`Found ${tenants?.length || 0} tenants for agency ${agencyId}`);
    console.log('Tenant data sample:', tenants?.slice(0, 2));
    
    // Mapper la réponse API au format attendu avec des informations de bail supplémentaires
    const tenantsWithLeaseInfo = tenants.map(tenant => {
      const tenantLeases = tenant.leases || [];
      const hasActiveLease = tenantLeases.some(lease => lease.status === 'active');
      const firstLease = tenantLeases[0] || {};
      
      return {
        id: tenant.id,
        firstName: tenant.first_name,
        lastName: tenant.last_name,
        email: tenant.email,
        phone: tenant.phone,
        profession: tenant.profession,
        employmentStatus: tenant.employment_status,
        photoUrl: tenant.photo_url,
        identityPhotos: tenant.identity_photos,
        emergencyContact: tenant.emergency_contact,
        hasLease: tenantLeases.length > 0,
        leaseId: hasActiveLease 
          ? tenantLeases.find(lease => lease.status === 'active')?.id 
          : firstLease?.id,
        leaseStatus: hasActiveLease 
          ? 'active' 
          : (tenantLeases.length > 0 ? firstLease.status : null),
        propertyId: hasActiveLease 
          ? tenantLeases.find(lease => lease.status === 'active')?.property_id 
          : firstLease?.property_id,
        createdAt: tenant.created_at
      };
    });

    return { tenants: tenantsWithLeaseInfo, error: null };
  } catch (error: any) {
    console.error('Error getting tenants for agency:', error);
    return { tenants: [], error: error.message };
  }
};
