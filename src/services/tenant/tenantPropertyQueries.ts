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
    
    // Récupérer les baux pour cette propriété, puis les locataires correspondants
    const { data: propertyLeases, error: propertyLeasesError } = await supabase
      .from('leases')
      .select('id, tenant_id, property_id, status')
      .eq('property_id', propertyId);

    if (propertyLeasesError) {
      console.error('Error fetching leases for property:', propertyLeasesError);
      throw propertyLeasesError;
    }

    const tenantIds = Array.from(new Set((propertyLeases || [])
      .map(l => l.tenant_id)
      .filter((id: string | null | undefined): id is string => !!id)));

    if (tenantIds.length === 0) {
      return { tenants: [], error: null };
    }

    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .in('id', tenantIds)
      .order('last_name', { ascending: true });

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError);
      throw tenantsError;
    }

    // Associer bail -> locataire
    const tenantIdToLease = new Map<string, { id: string; status: string | null; property_id: string | null }>();
    for (const lease of propertyLeases || []) {
      if (lease.tenant_id) {
        tenantIdToLease.set(lease.tenant_id, {
          id: lease.id,
          status: (lease as any).status ?? null,
          property_id: (lease as any).property_id ?? null,
        });
      }
    }

    const tenantsWithLeaseInfo = (allTenants || []).map(tenant => {
      const leaseInfo = tenantIdToLease.get(tenant.id);
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
        hasLease: !!leaseInfo,
        leaseId: leaseInfo?.id ?? null,
        leaseStatus: leaseInfo?.status ?? null,
        propertyId: leaseInfo?.property_id ?? null,
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
    
    // Récupérer TOUS les locataires de l'agence directement
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .eq('agency_id', agencyId)
      .order('last_name', { ascending: true });

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError);
      throw tenantsError;
    }

    console.log(`Found ${tenants?.length || 0} tenants for agency ${agencyId}`);
    console.log('Tenant data sample:', tenants?.slice(0, 2));

    // Récupérer les baux pour ces locataires (optionnel, pour enrichir les données)
    const tenantIds = (tenants || []).map(t => t.id);
    let leases: any[] = [];
    
    if (tenantIds.length > 0) {
      const { data: leasesData, error: leasesError } = await supabase
        .from('leases')
        .select('id, tenant_id, property_id, status')
        .in('tenant_id', tenantIds);

      if (leasesError) {
        console.error('Error fetching leases for tenants:', leasesError);
        // Ne pas faire échouer la requête principale à cause des baux
      } else {
        leases = leasesData || [];
      }
    }

    // Associer locataire -> premier bail trouvé
    const tenantIdToLease = new Map<string, { id: string; status: string | null; property_id: string | null }>();
    for (const lease of leases) {
      if (lease.tenant_id && !tenantIdToLease.has(lease.tenant_id)) {
        tenantIdToLease.set(lease.tenant_id, {
          id: lease.id,
          status: (lease as any).status ?? null,
          property_id: (lease as any).property_id ?? null,
        });
      }
    }
    
    const tenantsWithLeaseInfo = (tenants || []).map(tenant => {
      const leaseInfo = tenantIdToLease.get(tenant.id);
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
        hasLease: !!leaseInfo,
        leaseId: leaseInfo?.id ?? null,
        leaseStatus: leaseInfo?.status ?? null,
        propertyId: leaseInfo?.property_id ?? null,
        createdAt: tenant.created_at
      };
    });

    return { tenants: tenantsWithLeaseInfo, error: null };
  } catch (error: any) {
    console.error('Error getting tenants for agency:', error);
    return { tenants: [], error: error.message };
  }
};
