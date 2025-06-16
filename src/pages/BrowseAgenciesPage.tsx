
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { getAgenciesWithSubscriptions } from '@/services/subscription';
import { toast } from 'sonner';

import { BrowseAgenciesHeader } from '@/components/browse-agencies/BrowseAgenciesHeader';
import { SubscriptionStatus } from '@/components/browse-agencies/SubscriptionStatus';
import { AgencySearch } from '@/components/browse-agencies/AgencySearch';
import { AgencyList } from '@/components/browse-agencies/AgencyList';
import { NoAgenciesFound } from '@/components/browse-agencies/NoAgenciesFound';

interface AgencyWithSubscription {
  id: string;
  name: string;
  logoUrl?: string;
  subscription?: {
    plan?: {
      name: string;
      price: number;
    };
  };
}

export default function BrowseAgenciesPage() {
  const { user } = useAuth();
  const { subscription, checkLimit } = useUserSubscription();
  const [agencies, setAgencies] = useState<AgencyWithSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [agencyLimit, setAgencyLimit] = useState<any>(null);

  useEffect(() => {
    loadAgencies();
  }, []);

  useEffect(() => {
    checkAgencyLimits();
  }, [user]);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const { agencies: agenciesData, error } = await getAgenciesWithSubscriptions();
      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Error loading agencies:', error);
      toast.error('Erreur lors du chargement des agences');
    } finally {
      setLoading(false);
    }
  };

  const checkAgencyLimits = async () => {
    if (!user?.id) return;
    
    const limit = await checkLimit('agencies');
    setAgencyLimit(limit);
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateAgency = agencyLimit ? agencyLimit.allowed : true;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BrowseAgenciesHeader 
        user={user}
        canCreateAgency={canCreateAgency}
      />
      
      <SubscriptionStatus 
        user={user}
        subscription={subscription}
        agencyLimit={agencyLimit}
      />

      <AgencySearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {filteredAgencies.length > 0 ? (
        <AgencyList agencies={filteredAgencies} />
      ) : (
        <NoAgenciesFound
          searchTerm={searchTerm}
          user={user}
          canCreateAgency={canCreateAgency}
        />
      )}
    </div>
  );
}
