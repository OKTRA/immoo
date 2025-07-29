import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllAgencies } from '@/services/agency/agencyBasicService';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

import { AgencySearch } from '@/components/browse-agencies/AgencySearch';
import { AgencyList } from '@/components/browse-agencies/AgencyList';
import { NoAgenciesFound } from '@/components/browse-agencies/NoAgenciesFound';
import { Building2, Loader2 } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

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
  const { t } = useTranslation();
  const { user, profile, initialized } = useAuth();
  const [agencies, setAgencies] = useState<AgencyWithSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les agences dès que possible (pas besoin d'attendre l'auth pour cette page publique)
    loadAgencies();
    // If URL search param changes (e.g., via navigation), update search term
  }, [window.location.search]);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      console.log('🏢 Loading public agencies...');
      
      // Use getAllAgencies instead of getAgenciesWithSubscriptions
      // to show all public visible agencies, not just those with subscriptions
      const { agencies: agenciesData, error } = await getAllAgencies(50, 0, 'name', 'asc');
      
      if (error) {
        console.error('❌ Error loading agencies:', error);
        toast.error(`Erreur: ${error}`);
        return;
      }
      
      console.log('✅ Public agencies loaded:', agenciesData.length);
      
      // Transform agencies to match the expected interface
      const transformedAgencies: AgencyWithSubscription[] = agenciesData.map(agency => ({
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logoUrl,
        // We don't have subscription info from getAllAgencies, but that's fine for public browsing
        subscription: undefined
      }));
      
      setAgencies(transformedAgencies);
    } catch (error) {
      console.error('❌ Error loading agencies:', error);
      toast.error('Erreur lors du chargement des agences');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="bg-gradient-to-br from-immoo-pearl via-white to-immoo-gold/10 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Loading Header Skeleton */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl animate-pulse" />
            <div className="relative px-8 py-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-12 bg-gray-300 rounded-full animate-pulse" />
                    <div>
                      <div className="h-10 w-64 bg-gray-300 rounded animate-pulse mb-2" />
                      <div className="h-6 w-80 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 text-immoo-gold animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('browseAgencies.loading.title')}
              </h3>
              <p className="text-gray-600">
                {t('browseAgencies.loading.description')}
              </p>
            </div>
          </div>
        </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-immoo-pearl via-white to-immoo-gold/10 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8 mt-8 md:mt-16">
          <h1 className="text-3xl md:text-4xl font-bold text-immoo-navy mb-4">
            {t('browseAgencies.title')}
          </h1>
          <p className="text-lg text-immoo-navy/70 max-w-2xl mx-auto">
            {t('browseAgencies.subtitle')}
          </p>
        </div>

        <AgencySearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Results Section */}
        <div className="mb-6">
          {filteredAgencies.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-immoo-gold" />
                <span className="text-lg font-semibold text-gray-900">
                  {filteredAgencies.length} {filteredAgencies.length > 1 ? t('browseAgencies.results.foundPlural') : t('browseAgencies.results.found')}
                </span>
                {searchTerm && (
                  <span className="text-sm text-gray-600">
                    {t('browseAgencies.results.for')} "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {filteredAgencies.length > 0 ? (
          <AgencyList agencies={filteredAgencies} />
        ) : (
          <NoAgenciesFound
            searchTerm={searchTerm}
            user={user}
            canCreateAgency={true}
          />
        )}
      </div>
      </div>
    </ResponsiveLayout>
  );
}
