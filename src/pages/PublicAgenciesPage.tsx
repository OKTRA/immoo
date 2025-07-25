import React, { useState, useEffect } from 'react';
import { Agency } from '@/assets/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Star, Users, Home, Phone, Mail, Globe } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AgencyFilters, { AgencyFilters as FiltersType } from '@/components/agencies/AgencyFilters';
import { AgencyService } from '@/services/agency';

export default function PublicAgenciesPage() {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<FiltersType>({
    searchTerm: '',
    location: '',
    specialties: [],
    minRating: 0,
    maxRating: 5,
    minExperience: 0,
    maxExperience: 50,
    minProperties: 0,
    maxProperties: 1000,
    sortBy: 'rating_desc'
  });

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const data = await AgencyService.getAllAgencies();
      setAgencies(data);
      setFilteredAgencies(data);
    } catch (error) {
      console.error('Error loading agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filtered: Agency[]) => {
    setFilteredAgencies(filtered);
  };

  const handleFiltersUpdate = (filters: FiltersType) => {
    setCurrentFilters(filters);
  };

  const handleContactAgency = (agency: Agency) => {
    // Pour une vraie agence, naviguer vers sa page détaillée
    navigate(`/agency/${agency.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-gold-50 to-navy-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-600">Chargement des agences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-gold-50 to-navy-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trouvez votre agence immobilière
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleures agences immobilières avec notre système de filtrage avancé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AgencyFilters
              agencies={agencies}
              onFilterChange={handleFilterChange}
              onFiltersChange={handleFiltersUpdate}
            />
          </div>

          {/* Agencies Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredAgencies.length} agenc{filteredAgencies.length !== 1 ? 'es' : 'e'} trouvée{filteredAgencies.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAgencies.map((agency) => (
                <Card key={agency.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Building className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-white/90 text-primary">
                      <Star className="h-4 w-4 mr-1" />
                      {agency.rating || 0}/5
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{agency.name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{agency.location}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {agency.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{agency.agencyYearsActive || agency.years_of_experience || 0} ans d'expérience</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4 text-primary" />
                        <span>{agency.properties || agency.properties_count || 0} propriétés</span>
                      </div>
                    </div>
                    
                    {agency.specialties && agency.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Spécialités :</p>
                        <div className="flex flex-wrap gap-1">
                          {agency.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {agency.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agency.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleContactAgency(agency)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contacter
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleContactAgency(agency)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAgencies.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucune agence ne correspond à vos critères</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    // Reset filters would be handled by AgencyFilters
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
