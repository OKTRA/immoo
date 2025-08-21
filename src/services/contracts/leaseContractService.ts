import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Récupérer le contrat associé à un bail
 */
export const getContractByLeaseId = async (leaseId: string) => {
  try {
    // D'abord récupérer le contrat
    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('property_id', leaseId)
      .single();

    if (contractError && contractError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw contractError;
    }

    if (!contractData) {
      return null;
    }

    // Ensuite récupérer les informations du bail
    const { data: leaseData, error: leaseError } = await supabase
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
      .eq('id', leaseId)
      .single();

    if (leaseError) {
      console.error('Error getting lease data:', leaseError);
    }

    // Combiner les données
    return {
      ...contractData,
      lease: leaseData
    };
  } catch (error: any) {
    console.error('Error getting contract by lease:', error);
    toast.error('Erreur lors de la récupération du contrat');
    return null;
  }
};

/**
 * Vérifier si un bail a un contrat associé
 */
export const hasContract = async (leaseId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', leaseId);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error: any) {
    console.error('Error checking contract existence:', error);
    return false;
  }
};

/**
 * Rattacher un contrat existant à un bail
 */
export const attachContractToLease = async (contractId: string, leaseId: string) => {
  try {
    const { error } = await supabase
      .from('contracts')
      .update({ property_id: leaseId })
      .eq('id', contractId);

    if (error) throw error;
    
    toast.success('Contrat rattaché au bail avec succès');
    return true;
  } catch (error: any) {
    console.error('Error attaching contract to lease:', error);
    toast.error('Erreur lors du rattachement du contrat');
    return false;
  }
};

/**
 * Détacher un contrat d'un bail
 */
export const detachContractFromLease = async (contractId: string) => {
  try {
    const { error } = await supabase
      .from('contracts')
      .update({ property_id: null })
      .eq('id', contractId);

    if (error) throw error;
    
    toast.success('Contrat détaché du bail');
    return true;
  } catch (error: any) {
    console.error('Error detaching contract from lease:', error);
    toast.error('Erreur lors du détachement du contrat');
    return false;
  }
};

/**
 * Récupérer tous les contrats non rattachés d'une agence (pour les lier à des baux)
 */
export const getUnattachedContracts = async (agencyId: string) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('id, contract_type, status, created_at')
      .is('property_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting unattached contracts:', error);
    toast.error('Erreur lors de la récupération des contrats');
    return [];
  }
}; 