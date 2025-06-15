
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
  status: 'active' | 'suspended';
  is_visible: boolean;
}

export function useAgenciesManagement() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAgencies();
  }, [searchTerm, verificationFilter, sortBy, sortOrder, currentPage]);

  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('agencies')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply verification filter
      if (verificationFilter !== 'all') {
        query = query.eq('verified', verificationFilter === 'verified');
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

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
        description: agency.description,
        status: (agency.status === 'suspended' ? 'suspended' : 'active') as 'active' | 'suspended',
        is_visible: agency.is_visible !== false
      })) || [];

      setAgencies(transformedAgencies);
      setTotalCount(count || 0);
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
        .update({ verified: !currentVerified, updated_at: new Date().toISOString() })
        .eq('id', agencyId);

      if (error) throw error;

      await fetchAgencies();
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
      setTotalCount(prev => prev - 1);
      toast.success('Agence supprimée avec succès');
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast.error('Erreur lors de la suppression de l\'agence');
    }
  };

  const updateAgency = async (agencyId: string, updates: Partial<Agency>) => {
    try {
      const { error } = await supabase
        .from('agencies')
        .update({
          name: updates.name,
          location: updates.location,
          email: updates.email,
          phone: updates.phone,
          website: updates.website,
          description: updates.description,
          rating: updates.rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', agencyId);

      if (error) throw error;

      await fetchAgencies();
      toast.success('Agence mise à jour avec succès');
    } catch (error) {
      console.error('Error updating agency:', error);
      toast.error('Erreur lors de la mise à jour de l\'agence');
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    agencies,
    isLoading,
    searchTerm,
    setSearchTerm,
    verificationFilter,
    setVerificationFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    toggleVerification,
    deleteAgency,
    updateAgency,
    refreshAgencies: fetchAgencies
  };
}
