
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  agency_id: string;
  agency_name?: string;
  is_visible?: boolean;
  created_at: string;
  updated_at: string;
}

export function usePropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchProperties();
    fetchLocations();
  }, [searchTerm, statusFilter, typeFilter, locationFilter, sortBy, sortOrder, currentPage]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('location')
        .not('location', 'is', null);

      if (error) throw error;

      const uniqueLocations = [...new Set(data?.map(p => p.location).filter(Boolean))] as string[];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          type,
          location,
          price,
          status,
          bedrooms,
          bathrooms,
          area,
          agency_id,
          is_visible,
          created_at,
          updated_at
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.ilike('type', `%${typeFilter}%`);
      }

      // Apply location filter
      if (locationFilter !== 'all') {
        query = query.eq('location', locationFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data: propertiesData, error, count } = await query;

      if (error) throw error;

      // Fetch agency names separately
      const agencyIds = propertiesData?.map(p => p.agency_id).filter(Boolean) || [];
      let agencies: any[] = [];
      
      if (agencyIds.length > 0) {
        const { data: agenciesData, error: agenciesError } = await supabase
          .from('agencies')
          .select('id, name')
          .in('id', agencyIds);
        
        if (!agenciesError) {
          agencies = agenciesData || [];
        }
      }

      const transformedProperties: Property[] = propertiesData?.map(property => {
        const agency = agencies.find(a => a.id === property.agency_id);
        return {
          id: property.id,
          title: property.title,
          type: property.type,
          location: property.location || 'Non spécifié',
          price: property.price || 0,
          status: property.status || 'available',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          agency_id: property.agency_id,
          agency_name: agency?.name || 'Agence inconnue',
          is_visible: property.is_visible !== false,
          created_at: new Date(property.created_at).toLocaleDateString(),
          updated_at: new Date(property.updated_at).toLocaleDateString()
        };
      }) || [];

      setProperties(transformedProperties);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Erreur lors du chargement des propriétés');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { ...property, status: newStatus }
          : property
      ));

      toast.success('Statut de la propriété mis à jour avec succès');
    } catch (error) {
      console.error('Error updating property status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const togglePropertyVisibility = async (propertyId: string) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;

      const newVisibility = !property.is_visible;
      
      const { error } = await supabase
        .from('properties')
        .update({ is_visible: newVisibility })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(p => 
        p.id === propertyId 
          ? { ...p, is_visible: newVisibility }
          : p
      ));

      toast.success(`Propriété ${newVisibility ? 'affichée' : 'masquée'} avec succès`);
    } catch (error) {
      console.error('Error toggling property visibility:', error);
      toast.error('Erreur lors de la modification de la visibilité');
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.filter(property => property.id !== propertyId));
      setTotalCount(prev => prev - 1);
      toast.success('Propriété supprimée avec succès');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Erreur lors de la suppression de la propriété');
    }
  };

  const moderateProperty = async (propertyId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'available' : 'rejected';
      await updatePropertyStatus(propertyId, newStatus);
      toast.success(`Propriété ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`);
    } catch (error) {
      console.error('Error moderating property:', error);
      toast.error('Erreur lors de la modération de la propriété');
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    properties,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    locationFilter,
    setLocationFilter,
    locations,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    updatePropertyStatus,
    togglePropertyVisibility,
    deleteProperty,
    moderateProperty,
    refreshProperties: fetchProperties
  };
}
