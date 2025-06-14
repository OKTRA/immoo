
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Agency {
  id: string;
  name: string;
  location: string;
  properties_count: number;
  verified: boolean;
  rating: number;
  created_at: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
}

export function useAgenciesManagement() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedAgencies: Agency[] = data?.map(agency => ({
        id: agency.id,
        name: agency.name,
        location: agency.location || 'Non spécifié',
        properties_count: agency.properties_count || 0,
        verified: agency.verified || false,
        rating: agency.rating ? Number(agency.rating) : 0,
        created_at: new Date(agency.created_at).toLocaleDateString(),
        email: agency.email,
        phone: agency.phone,
        website: agency.website,
        description: agency.description
      })) || [];

      setAgencies(transformedAgencies);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast.error('Erreur lors du chargement des agences');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerification = async (agencyId: string, currentVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('agencies')
        .update({ verified: !currentVerified })
        .eq('id', agencyId);

      if (error) throw error;

      setAgencies(agencies.map(agency => 
        agency.id === agencyId 
          ? { ...agency, verified: !currentVerified }
          : agency
      ));

      toast.success(
        !currentVerified 
          ? 'Agence vérifiée avec succès' 
          : 'Vérification de l\'agence retirée'
      );
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast.error('Erreur lors de la modification de la vérification');
    }
  };

  const deleteAgency = async (agencyId: string) => {
    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', agencyId);

      if (error) throw error;

      setAgencies(agencies.filter(agency => agency.id !== agencyId));
      toast.success('Agence supprimée avec succès');
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast.error('Erreur lors de la suppression de l\'agence');
    }
  };

  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    agency.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    agencies: filteredAgencies,
    isLoading,
    searchTerm,
    setSearchTerm,
    toggleVerification,
    deleteAgency,
    refreshAgencies: fetchAgencies
  };
}
