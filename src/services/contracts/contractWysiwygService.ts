import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ContractData {
  id?: string;
  title: string;
  type: string;
  jurisdiction: string;
  content: string;
  parties: Record<string, any>;
  details: Record<string, any>;
  status: 'draft' | 'assigned' | 'signed';
  agency_id?: string;
  lease_id?: string;
  property_id?: string;
  tenant_id?: string;
  created_by?: string;
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

    const { data, error } = await supabase
      .from('contracts')
      .insert([{
        ...contractData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
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
    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...contractData,
        updated_at: new Date().toISOString()
      })
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
      .select(`
        *,
        agencies:agency_id (
          id,
          name
        ),
        leases:lease_id (
          id,
          start_date,
          end_date,
          monthly_rent,
          tenants:tenant_id (
            id,
            first_name,
            last_name
          ),
          properties:property_id (
            id,
            title,
            location
          )
        )
      `)
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
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        leases:lease_id (
          id,
          start_date,
          end_date,
          tenants:tenant_id (
            first_name,
            last_name
          ),
          properties:property_id (
            title
          )
        )
      `)
      .eq('agency_id', agencyId)
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
    const { error } = await supabase
      .from('contracts')
      .update({
        lease_id: leaseId,
        status: 'assigned', // Met le statut à 'assigned' lors de l'attribution
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (error) throw error;

    toast.success('Contrat attribué au bail avec succès');
    return true;
  } catch (error: any) {
    console.error('Error assigning contract to lease:', error);
    toast.error('Erreur lors de l\'attribution du contrat');
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
          title,
          location
        )
      `)
      .eq('properties.agency_id', agencyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(lease => ({
      id: lease.id,
      title: `Bail - ${lease.properties?.title || 'Propriété'}`,
      tenantName: `${lease.tenants?.first_name || ''} ${lease.tenants?.last_name || ''}`.trim(),
      propertyName: lease.properties?.title || 'Propriété inconnue',
      startDate: lease.start_date,
      endDate: lease.end_date,
      monthlyRent: lease.monthly_rent
    }));
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
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('lease_id', leaseId)
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
        status: 'signed',
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

 