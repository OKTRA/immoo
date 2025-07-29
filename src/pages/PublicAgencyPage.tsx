import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAgencyById } from '@/services/agency';
import { getPublicPropertiesByAgencyId } from '@/services/agency/agencyPropertiesService';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
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
            <h1 className="text-2xl font-bold mb-2">{t('publicAgency.notFound.title')}</h1>
            <p className="text-muted-foreground">{t('publicAgency.notFound.description')}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-gold/5 dark:from-immoo-navy dark:via-immoo-navy-light/50 dark:to-immoo-navy">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-immoo-gold/5 via-transparent to-immoo-navy/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 py-8 sm:py-12 relative">
            <div className="max-w-6xl mx-auto">
              {/* Mobile-First Layout */}
              <div className="space-y-8">
                {/* Agency Header Card */}
                <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Agency Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 shadow-xl ring-4 ring-white/50 dark:ring-immoo-gold/20">
                        {agency.logoUrl ? (
                          <img 
                            src={agency.logoUrl} 
                            alt={agency.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-immoo-gold to-immoo-navy">
                            <Building className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                          </div>
                        )}
                      </div>
                      {agency.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2 shadow-lg ring-2 ring-white">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Agency Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="space-y-3">
                        <div>
                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-2">
                            {agency.name}
                          </h1>
                          {agency.verified && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t('publicAgency.certified')}
                            </Badge>
                          )}
                        </div>
                        
                        {agency.location && (
                          <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-300">
                            <MapPin className="h-5 w-5 mr-2 text-immoo-gold" />
                            <span className="text-base sm:text-lg font-medium">{agency.location}</span>
                          </div>
                        )}
                        
                        {agency.description && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                            {agency.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Rating Card */}
                  <div className="group bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-immoo-gold/10 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                        <Star className="h-6 w-6 text-white fill-current" />
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
                          {agency.rating.toFixed(1)}
                          <span className="text-lg text-gray-500 ml-1">/5</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('publicAgency.stats.rating')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Properties Card */}
                  <div className="group bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-immoo-gold/10 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
                          {agency.properties}
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {agency.properties > 1 ? t('publicAgency.stats.propertiesPlural') : t('publicAgency.stats.properties')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Experience Card */}
                  <div className="group bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-immoo-gold/10 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 sm:col-span-1">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-immoo-navy dark:text-immoo-pearl">
                          {yearsActive}
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {yearsActive > 1 ? t('publicAgency.stats.experiencePlural') : t('publicAgency.stats.experience')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Contact Information - Full Width Modern Card */}
            <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-immoo-gold to-immoo-navy shadow-xl mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-immoo-navy dark:text-immoo-pearl mb-2">
                  {t('publicAgency.contact.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  {t('publicAgency.contact.description')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {agency.phone && (
                  <a 
                    href={`tel:${agency.phone}`}
                    className="group flex items-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{t('publicAgency.contact.phone')}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base truncate">
                        {agency.phone}
                      </p>
                    </div>
                  </a>
                )}
                
                {agency.email && (
                  <a 
                    href={`mailto:${agency.email}`}
                    className="group flex items-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/40 dark:hover:to-green-700/40 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-green-200/50 dark:border-green-700/50"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500 shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{t('publicAgency.contact.email')}</p>
                      <p className="text-green-600 dark:text-green-400 font-medium text-sm sm:text-base truncate">
                        {agency.email}
                      </p>
                    </div>
                  </a>
                )}
                
                {agency.website && (
                  <a 
                    href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/40 dark:hover:to-purple-700/40 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-purple-200/50 dark:border-purple-700/50"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500 shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Globe className="h-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{t('publicAgency.contact.website')}</p>
                      <p className="text-purple-600 dark:text-purple-400 font-medium text-sm sm:text-base truncate flex items-center">
                        {agency.website}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </p>
                    </div>
                  </a>
                )}
              </div>
              
              {(!agency.phone && !agency.email && !agency.website) && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                    <Phone className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {t('publicAgency.contact.noContact')}
                  </p>
                </div>
              )}
            </div>

            {/* Specialties Section */}
            {agency.specialties && agency.specialties.length > 0 && (
              <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-xl mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-immoo-navy dark:text-immoo-pearl mb-2">
                    {t('publicAgency.specialties.title')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                    {t('publicAgency.specialties.description')}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  {agency.specialties.map((specialty, index) => (
                    <div 
                      key={index}
                      className="inline-flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                        {specialty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties Section */}
            <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 overflow-hidden">
              <div className="bg-gradient-to-r from-immoo-gold/10 to-immoo-navy/10 p-6 sm:p-8 border-b border-white/20 dark:border-immoo-gold/10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-immoo-gold to-immoo-navy shadow-xl mb-4">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-immoo-navy dark:text-immoo-pearl mb-2">
                    {t('publicAgency.properties.title')}
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-immoo-gold text-immoo-navy text-sm font-bold ml-3">
                      {properties.length}
                    </span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                    {t('publicAgency.properties.description')} {agency.name}
                  </p>
                </div>
              </div>
              
              <div className="p-6 sm:p-8">
                {propertiesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <PropertyList properties={properties} />
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
                      <Home className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {t('publicAgency.properties.noProperties.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                      {t('publicAgency.properties.noProperties.description')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
