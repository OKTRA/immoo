
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAgencyById } from '@/services/agency';
import { getPublicPropertiesByAgencyId } from '@/services/agency/agencyPropertiesService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Star, Phone, Mail, Globe, CheckCircle, Home, Users, Calendar, Award } from 'lucide-react';
import PropertyList from '@/components/properties/PropertyList';
import { formatCurrency } from '@/lib/utils';
import { Agency } from '@/assets/types';

export default function PublicAgencyPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  
  console.log('PublicAgencyPage - Agency ID from params:', agencyId);
  
  const { data: agencyResult, isLoading: agencyLoading, error: agencyError } = useQuery({
    queryKey: ['public-agency', agencyId],
    queryFn: () => agencyId ? getAgencyById(agencyId) : Promise.resolve({ agency: null, error: 'No agency ID' }),
    enabled: !!agencyId,
  });

  const { data: propertiesResult, isLoading: propertiesLoading } = useQuery({
    queryKey: ['public-agency-properties', agencyId],
    queryFn: () => agencyId ? getPublicPropertiesByAgencyId(agencyId) : Promise.resolve({ properties: [], error: null }),
    enabled: !!agencyId,
  });

  if (agencyLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (agencyError || agencyResult?.error || !agencyResult?.agency) {
    console.error('PublicAgencyPage - Error or no agency found:', agencyError, agencyResult?.error);
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Agence introuvable</h1>
            <p className="text-muted-foreground">Cette agence n'existe pas ou n'est plus disponible.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const agency: Agency = agencyResult.agency;
  const properties = propertiesResult?.properties || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          {/* Agency Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-background">
                    {agency.logoUrl ? (
                      <img 
                        src={agency.logoUrl} 
                        alt={agency.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <Building className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  {agency.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {agency.name}
                    </h1>
                    {agency.verified && (
                      <Badge className="bg-green-500 text-white w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Agence vérifiée
                      </Badge>
                    )}
                  </div>
                  
                  {agency.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{agency.location}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{agency.rating.toFixed(1)}</span>
                      <span className="ml-1">sur 5</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      <span>{agency.properties} propriété{agency.properties > 1 ? 's' : ''}</span>
                    </div>
                    {agency.agencyYearsActive && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{agency.agencyYearsActive} an{agency.agencyYearsActive > 1 ? 's' : ''} d'expérience</span>
                      </div>
                    )}
                  </div>
                  
                  {agency.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {agency.description}
                    </p>
                  )}
                  
                  {/* Specialties */}
                  {agency.specialties && agency.specialties.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Spécialités</h3>
                      <div className="flex flex-wrap gap-2">
                        {agency.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Propriétés disponibles ({properties.length})
              </CardTitle>
              <CardDescription>
                Découvrez les biens immobiliers proposés par {agency.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <PropertyList properties={properties} />
              ) : (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Aucune propriété disponible
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Cette agence n'a actuellement aucune propriété disponible à la location.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
