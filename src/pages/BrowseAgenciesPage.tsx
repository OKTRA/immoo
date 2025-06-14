
import { useQuery } from "@tanstack/react-query";
import { getAllAgencies } from "@/services/agency";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Star, Phone, Mail, Globe, BadgeCheck, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function BrowseAgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-agencies'],
    queryFn: () => getAllAgencies(50, 0, 'rating', 'desc'),
  });

  const agencies = data?.agencies || [];

  // Filter agencies based on search term and location
  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = !searchTerm || 
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agency.description && agency.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !filterLocation || 
      (agency.location && agency.location.toLowerCase().includes(filterLocation.toLowerCase()));
    
    return matchesSearch && matchesLocation;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Découvrez nos agences partenaires
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Trouvez l'agence immobilière parfaite pour vos projets. 
              Nos partenaires sont sélectionnés pour leur expertise et leur service client exceptionnel.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher une agence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Filtrer par localisation..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-600 dark:text-gray-300">
                {filteredAgencies.length} agence{filteredAgencies.length > 1 ? 's' : ''} trouvée{filteredAgencies.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Agencies Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <AnimatedCard key={i} className="p-6 h-96">
                  <div className="animate-pulse flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-muted/50 rounded-full mr-4"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-muted/50 rounded w-full"></div>
                      <div className="h-4 bg-muted/50 rounded w-2/3"></div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Impossible de charger les agences</h3>
              <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
            </div>
          ) : filteredAgencies.length === 0 ? (
            <div className="text-center py-16">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucune agence trouvée</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAgencies.map((agency) => (
                <AnimatedCard key={agency.id} className="p-6 hover:shadow-xl transition-all duration-300 group">
                  {/* Agency Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-background">
                        {agency.logoUrl ? (
                          <img 
                            src={agency.logoUrl} 
                            alt={agency.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <Building className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      {agency.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <BadgeCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {agency.name}
                      </h3>
                      {agency.location && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm truncate">{agency.location}</span>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">{agency.rating.toFixed(1)}</span>
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {agency.properties} propriété{agency.properties > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {agency.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {agency.description}
                    </p>
                  )}

                  {/* Specialties */}
                  {agency.specialties && agency.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {agency.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {agency.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agency.specialties.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-2 mb-6">
                    {agency.phone && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{agency.phone}</span>
                      </div>
                    )}
                    {agency.email && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{agency.email}</span>
                      </div>
                    )}
                    {agency.website && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="truncate">{agency.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <Button asChild className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                      <Link to={`/agency-profile/${agency.id}`}>
                        Voir le profil complet
                      </Link>
                    </Button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
