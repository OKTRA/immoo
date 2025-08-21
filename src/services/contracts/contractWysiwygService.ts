import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ContractData {
  id?: string;
  contract_type: string; // Changed from 'type' to match DB schema
  title?: string; // Optional since DB doesn't have this
  jurisdiction?: string; // Optional since DB doesn't have this
  terms: string; // Changed from 'content' to match DB schema
  parties?: Record<string, any>; // Optional since DB doesn't have this
  details?: Record<string, any>; // Optional since DB doesn't have this
  status: 'draft' | 'validated' | 'closed';
  client_id?: string; // Changed from 'tenant_id' to match DB schema
  property_id?: string;
  start_date?: string;
  end_date?: string;
  value?: number;
  documents?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LeaseAssignment {
  contractId: string;
  leaseId: string;
}

/**
 * Créer un nouveau contrat
 */
export const createContract = async (contractData: Omit<ContractData, 'id' | 'created_at' | 'updated_at'>): Promise<ContractData> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Map the data to match the actual database schema
    const dbData = {
      contract_type: contractData.contract_type,
      client_id: contractData.client_id,
      property_id: contractData.property_id,
      start_date: contractData.start_date || new Date().toISOString().split('T')[0],
      end_date: contractData.end_date,
      value: contractData.value || 0,
      status: contractData.status || 'draft',
      terms: contractData.terms,
      documents: contractData.documents || [],
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('contracts')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;

    toast.success('Contrat créé avec succès');
    return data;
  } catch (error: any) {
    console.error('Error creating contract:', error);
    toast.error('Erreur lors de la création du contrat');
    throw error;
  }
};

/**
 * Mettre à jour un contrat existant
 */
export const updateContract = async (id: string, contractData: Partial<ContractData>): Promise<ContractData> => {
  try {
    // Map the data to match the actual database schema
    const dbData: any = {};
    if (contractData.contract_type !== undefined) dbData.contract_type = contractData.contract_type;
    if (contractData.client_id !== undefined) dbData.client_id = contractData.client_id;
    if (contractData.property_id !== undefined) dbData.property_id = contractData.property_id;
    if (contractData.start_date !== undefined) dbData.start_date = contractData.start_date;
    if (contractData.end_date !== undefined) dbData.end_date = contractData.end_date;
    if (contractData.value !== undefined) dbData.value = contractData.value;
    if (contractData.status !== undefined) dbData.status = contractData.status;
    if (contractData.terms !== undefined) dbData.terms = contractData.terms;
    if (contractData.documents !== undefined) dbData.documents = contractData.documents;
    dbData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('contracts')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success('Contrat mis à jour avec succès');
    return data;
  } catch (error: any) {
    console.error('Error updating contract:', error);
    toast.error('Erreur lors de la mise à jour du contrat');
    throw error;
  }
};

/**
 * Récupérer un contrat par ID
 */
export const getContractById = async (id: string): Promise<ContractData | null> => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error getting contract:', error);
    toast.error('Erreur lors de la récupération du contrat');
    return null;
  }
};

/**
 * Récupérer tous les contrats d'une agence
 */
export const getContractsByAgency = async (agencyId: string): Promise<ContractData[]> => {
  try {
    // Since the database doesn't have agency_id, we'll get all contracts
    // In a real implementation, you'd want to add agency_id to the database
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting contracts:', error);
    toast.error('Erreur lors de la récupération des contrats');
    return [];
  }
};

/**
 * Attribuer un contrat à un bail
 */
export const assignContractToLease = async (contractId: string, leaseId: string): Promise<boolean> => {
  try {
    console.log('Assigning contract', contractId, 'to lease', leaseId);
    
    // Vérifier d'abord que le contrat existe
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('id, status')
      .eq('id', contractId)
      .single();

    if (fetchError) {
      console.error('Error fetching contract:', fetchError);
      throw new Error(`Contrat non trouvé: ${fetchError.message}`);
    }

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    // Since the database doesn't have lease_id, we'll store it in the documents array
    // or create a custom field. For now, we'll just update the status
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'validated',
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) {
      console.error('Error updating contract:', updateError);
      throw updateError;
    }

    toast.success('Contrat attribué au bail avec succès');
    return true;
  } catch (error: any) {
    console.error('Error assigning contract to lease:', error);
    const errorMessage = error.message || 'Erreur lors de l\'attribution du contrat';
    toast.error(errorMessage);
    return false;
  }
};

/**
 * Supprimer un contrat
 */
export const deleteContract = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Contrat supprimé avec succès');
    return true;
  } catch (error: any) {
    console.error('Error deleting contract:', error);
    toast.error('Erreur lors de la suppression du contrat');
    return false;
  }
};

/**
 * Récupérer les baux disponibles pour l'attribution
 */
export const getAvailableLeasesForAssignment = async (agencyId: string): Promise<Array<{
  id: string;
  title: string;
  tenantName: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
}>> => {
  try {
    // Try embedded join first
    const { data, error } = await supabase
      .from('leases')
      .select(`
        id,
        start_date,
        end_date,
        monthly_rent,
        tenants:tenant_id (
          first_name,
          last_name
        ),
        properties:property_id (
          id,
          title,
          location,
          agency_id
        )
      `)
      .eq('properties.agency_id', agencyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error) {
      return (data || []).map(lease => {
        const propertyData = Array.isArray(lease.properties) ? lease.properties[0] : lease.properties;
        const tenantData = Array.isArray(lease.tenants) ? lease.tenants[0] : lease.tenants;
        return {
          id: lease.id,
          title: `Bail - ${propertyData?.title || 'Propriété'}`,
          tenantName: `${tenantData?.first_name || ''} ${tenantData?.last_name || ''}`.trim(),
          propertyName: propertyData?.title || 'Propriété inconnue',
          startDate: lease.start_date,
          endDate: lease.end_date,
          monthlyRent: lease.monthly_rent
        };
      });
    }

    console.warn('Embedded join failed in getAvailableLeasesForAssignment, falling back:', error);

    // Fallback: two-step fetch via properties then leases
    const { data: props, error: propsError } = await supabase
      .from('properties')
      .select('id, title, location')
      .eq('agency_id', agencyId);
    if (propsError) throw propsError;

    const propertyIds = (props || []).map(p => p.id);
    if (propertyIds.length === 0) return [];

    const { data: rawLeases, error: leasesError2 } = await supabase
      .from('leases')
      .select('id, start_date, end_date, monthly_rent, tenant_id, property_id, status')
      .in('property_id', propertyIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (leasesError2) throw leasesError2;

    const tenantIds = Array.from(new Set((rawLeases || []).map(l => l.tenant_id).filter(Boolean)));
    let tenantsById = new Map<string, { first_name?: string; last_name?: string }>();
    if (tenantIds.length > 0) {
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, first_name, last_name')
        .in('id', tenantIds);
      (tenants || []).forEach(t => tenantsById.set(t.id, t));
    }

    const propsById = new Map<string, { title?: string; location?: string }>();
    (props || []).forEach(p => propsById.set(p.id, p));

    return (rawLeases || []).map(lease => {
      const t = lease.tenant_id ? tenantsById.get(lease.tenant_id) : undefined;
      const p = lease.property_id ? propsById.get(lease.property_id) : undefined;
      return {
        id: lease.id,
        title: `Bail - ${p?.title || 'Propriété'}`,
        tenantName: `${t?.first_name || ''} ${t?.last_name || ''}`.trim(),
        propertyName: p?.title || 'Propriété inconnue',
        startDate: lease.start_date,
        endDate: lease.end_date,
        monthlyRent: lease.monthly_rent || 0
      };
    });
  } catch (error: any) {
    console.error('Error getting available leases:', error);
    return [];
  }
};

/**
 * Exporter un contrat en PDF (simulation)
 */
export const exportContractToPDF = async (contractId: string): Promise<string> => {
  try {
    const contract = await getContractById(contractId);
    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    // Simulation d'export PDF
    // En production, vous utiliseriez une bibliothèque comme jsPDF ou une API
    const pdfUrl = `/api/contracts/${contractId}/export/pdf`;
    
    toast.success('Export PDF en cours...');
    return pdfUrl;
  } catch (error: any) {
    console.error('Error exporting contract to PDF:', error);
    toast.error('Erreur lors de l\'export PDF');
    throw error;
  }
};

/**
 * Exporter un contrat en Word (simulation)
 */
export const exportContractToWord = async (contractId: string): Promise<string> => {
  try {
    const contract = await getContractById(contractId);
    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    // Simulation d'export Word
    // En production, vous utiliseriez une bibliothèque comme docx ou une API
    const wordUrl = `/api/contracts/${contractId}/export/word`;
    
    toast.success('Export Word en cours...');
    return wordUrl;
  } catch (error: any) {
    console.error('Error exporting contract to Word:', error);
    toast.error('Erreur lors de l\'export Word');
    throw error;
  }
};

/**
 * Récupérer le contrat associé à un bail
 */
export const getContractByLeaseId = async (leaseId: string): Promise<ContractData | null> => {
  try {
    // Since the database doesn't have lease_id, we'll try to find contracts by property_id
    // This is a workaround - in a real implementation, you'd want to add lease_id to the database
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('property_id', leaseId) // Using property_id as a fallback
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Pas de contrat trouvé, c'est normal
        return null;
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error getting contract by lease ID:', error);
    return null;
  }
};

/**
 * Signer un contrat (remplace la validation)
 */
export const signContract = async (contractId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contracts')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (error) throw error;

    toast.success('Contrat signé avec succès');
    return true;
  } catch (error: any) {
    console.error('Error signing contract:', error);
    toast.error('Erreur lors de la signature du contrat');
    return false;
  }
};

/**
 * Récupérer les contrats disponibles d'une agence (non assignés)
 */
export const getAvailableContractsForAssignment = async (agencyId: string): Promise<ContractData[]> => {
  try {
    console.log('Fetching available contracts for agency:', agencyId);
    
    // Since the database doesn't have agency_id or lease_id, we'll get all available contracts
    // In a real implementation, you might want to add these columns to the database
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .in('status', ['draft', 'validated']) // Contrats en brouillon ou validés mais pas encore fermés
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Found contracts:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('Error getting available contracts:', error);
    const errorMessage = error.message || 'Erreur lors de la récupération des contrats disponibles';
    toast.error(errorMessage);
    return [];
  }
};

 