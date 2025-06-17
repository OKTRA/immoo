import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAgencyById } from '@/services/agency';
import { getPublicPropertiesByAgencyId } from '@/services/agency/agencyPropertiesService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Star, Phone, Mail, Globe, CheckCircle, Home, Users, Calendar, Award, ExternalLink } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
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
  
  // Calculate years active from agency data if available
  const yearsActive = agency.agencyYearsActive || (() => {
    if (agency.id) {
      // Fallback calculation if not provided
      return 1;
    }
    return 1;
  })();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        {/* Hero Section with Agency Profile */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-b">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Agency Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-background">
                    {agency.logoUrl ? (
                      <img 
                        src={agency.logoUrl} 
                        alt={agency.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <Building className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  {agency.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-3 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Agency Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {agency.name}
                    </h1>
                    {agency.verified && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white mb-4">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Agence vérifiée
                      </Badge>
                    )}
                    </div>
                  </div>
                  
                  {agency.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-lg">{agency.location}</span>
                    </div>
                  )}
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start mb-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{agency.rating.toFixed(1)}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">/5</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start mb-2">
                        <Home className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{agency.properties}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Propriété{agency.properties > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start mb-2">
                        <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{yearsActive}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">An{yearsActive > 1 ? 's' : ''} d'expérience</p>
                    </div>
                  </div>
                  
                  {agency.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                      {agency.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Contact & Specialties Section */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Phone className="w-5 h-5 mr-2 text-blue-500" />
                    Informations de contact
                  </CardTitle>
                  <CardDescription>
                    Contactez notre équipe pour plus d'informations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agency.phone && (
                    <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <Phone className="w-5 h-5 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Téléphone</p>
                        <a 
                          href={`tel:${agency.phone}`} 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {agency.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {agency.email && (
                    <div className="flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <Mail className="w-5 h-5 text-green-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                        <a 
                          href={`mailto:${agency.email}`} 
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          {agency.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {agency.website && (
                    <div className="flex items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <Globe className="w-5 h-5 text-purple-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Site web</p>
                        <a 
                          href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center"
                        >
                          {agency.website}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                </div>
              </div>
                  )}
                  
                  {(!agency.phone && !agency.email && !agency.website) && (
                    <div className="text-center py-6">
                      <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Informations de contact non disponibles
                      </p>
                    </div>
                  )}
            </CardContent>
          </Card>

              {/* Specialties */}
              {agency.specialties && agency.specialties.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <Award className="w-5 h-5 mr-2 text-orange-500" />
                      Spécialités
              </CardTitle>
              <CardDescription>
                      Domaines d'expertise de l'agence
              </CardDescription>
            </CardHeader>
            <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {agency.specialties.map((specialty, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border-0">
                            {specialty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Properties Section */}
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-2xl">
                      <Home className="w-6 h-6 mr-3 text-blue-500" />
                      Propriétés disponibles
                      <Badge variant="secondary" className="ml-3 text-lg px-3 py-1">
                        {properties.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Découvrez les biens immobiliers proposés par {agency.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
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
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Home className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    Aucune propriété disponible
                  </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Cette agence n'a actuellement aucune propriété disponible à la location.
                      Contactez-les directement pour connaître les futures disponibilités.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
