
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
  created_at: string;
  updated_at: string;
}

export function usePropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const { data: propertiesData, error } = await supabase
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
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

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
          created_at: new Date(property.created_at).toLocaleDateString(),
          updated_at: new Date(property.updated_at).toLocaleDateString()
        };
      }) || [];

      setProperties(transformedProperties);
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

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.filter(property => property.id !== propertyId));
      toast.success('Propriété supprimée avec succès');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Erreur lors de la suppression de la propriété');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.agency_name && property.agency_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatusFilter = statusFilter === 'all' || property.status === statusFilter;
    const matchesTypeFilter = typeFilter === 'all' || property.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  return {
    properties: filteredProperties,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    updatePropertyStatus,
    deleteProperty,
    refreshProperties: fetchProperties
  };
}
