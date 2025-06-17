import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById, getPropertiesByAgencyId, getAgencyStatistics } from "@/services/agency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Building, 
  Building2, 
  Home, 
  Users, 
  BarChart3, 
  ArrowUpRight, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  TrendingUp,
  Star,
  Calendar,
  Eye,
  Plus,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { Agency } from "@/assets/types";
import PropertyList from "@/components/properties/PropertyList";
import { formatCurrency } from "@/lib/utils";

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    data: agencyData, 
    isLoading: isLoadingAgency, 
    error: agencyError 
  } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId
  });

  const { 
    data: propertiesData, 
    isLoading: isLoadingProperties
  } = useQuery({
    queryKey: ['agency-properties', agencyId],
    queryFn: () => getPropertiesByAgencyId(agencyId || ''),
    enabled: !!agencyId
  });

  const { 
    data: statsData, 
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['agency-stats', agencyId],
    queryFn: () => getAgencyStatistics(agencyId || ''),
    enabled: !!agencyId
  });

  useEffect(() => {
    if (agencyError) {
      toast.error("Impossible de charger les détails de l'agence");
      navigate("/agencies");
    }
  }, [agencyError, navigate]);

  const agency: Agency | null = agencyData?.agency || null;
  const properties = propertiesData?.properties || [];
  const propertiesCount = propertiesData?.count || 0;
  const stats = statsData?.statistics || { propertiesCount: 0, avgRating: 0, recentListings: [] };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value !== "overview" && agencyId) {
      navigate(`/agencies/${agencyId}/${value}`, { replace: true });
    } else if (agencyId) {
      navigate(`/agencies/${agencyId}`, { replace: true });
    }
  };

  if (isLoadingAgency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/50">
        <div className="container mx-auto py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gradient-to-r from-immoo-gold/20 to-immoo-navy/20 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-immoo-gray/20 rounded-2xl"></div>
              <div className="h-64 bg-immoo-gray/20 rounded-2xl"></div>
              <div className="h-64 bg-immoo-gray/20 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/50">
        <div className="container mx-auto py-16 px-4">
          <Card className="text-center p-8 border-immoo-gray/30 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-full p-4 w-20 h-20 flex items-center justify-center mb-6">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-immoo-navy">Agence non trouvée</CardTitle>
              <CardDescription className="text-lg text-immoo-gray">
                Cette agence n'existe pas ou a été supprimée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/agencies")}
                className="bg-gradient-to-r from-immoo-gold to-immoo-navy hover:from-immoo-navy hover:to-immoo-gold text-white px-8 py-3 text-lg"
              >
                Retour à la liste des agences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-pearl/50">
      {/* Hero Section avec informations de l'agence */}
      <div className="bg-gradient-to-r from-immoo-navy via-immoo-navy-light to-immoo-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-immoo-gold/10 to-transparent"></div>
        <div className="container mx-auto py-12 px-4 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-immoo-gold shadow-2xl overflow-hidden bg-white">
                  {agency.logoUrl ? (
                    <img 
                      src={agency.logoUrl} 
                      alt={agency.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-immoo-gold to-immoo-navy">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                {agency.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-immoo-gold rounded-full p-2 shadow-lg">
                    <Star className="w-4 h-4 text-immoo-navy" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-immoo-pearl mb-2">
                  {agency.name}
                </h1>
                <div className="flex items-center text-immoo-pearl/80 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">{agency.location}</span>
                </div>
                {agency.phone && (
                  <div className="flex items-center text-immoo-pearl/70">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{agency.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                className="bg-immoo-gold hover:bg-immoo-gold/90 text-immoo-navy font-semibold px-6 py-3 shadow-lg" 
                asChild
              >
                <Link to={`/agencies/${agencyId}/properties/create`}>
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter une propriété
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-immoo-pearl text-immoo-pearl hover:bg-immoo-pearl hover:text-immoo-navy px-6 py-3" 
                asChild
              >
                <Link to={`/agencies/${agencyId}/tenants`}>
                  <Users className="h-5 w-5 mr-2" />
                  Gérer les locataires
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-immoo-navy/70 text-sm font-medium">Propriétés</p>
                  <p className="text-3xl font-bold text-immoo-navy">{propertiesCount}</p>
                </div>
                <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-3 rounded-xl">
                  <Building className="h-8 w-8 text-immoo-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-immoo-navy/70 text-sm font-medium">Note moyenne</p>
                  <p className="text-3xl font-bold text-immoo-navy">{agency.rating?.toFixed(1) || '0.0'}</p>
                </div>
                <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-3 rounded-xl">
                  <Star className="h-8 w-8 text-immoo-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-immoo-navy/70 text-sm font-medium">Vues ce mois</p>
                  <p className="text-3xl font-bold text-immoo-navy">1,247</p>
                </div>
                <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-3 rounded-xl">
                  <Eye className="h-8 w-8 text-immoo-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-immoo-navy/70 text-sm font-medium">Croissance</p>
                  <p className="text-3xl font-bold text-immoo-navy">+12%</p>
                </div>
                <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-3 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="bg-white/95 backdrop-blur-sm border-immoo-gray/30 shadow-lg p-1 mb-8">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-immoo-navy text-immoo-navy/70 font-medium px-6 py-3"
            >
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-immoo-navy text-immoo-navy/70 font-medium px-6 py-3"
            >
              Propriétés
            </TabsTrigger>
            <TabsTrigger 
              value="tenants" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-immoo-navy text-immoo-navy/70 font-medium px-6 py-3"
            >
              Locataires
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-immoo-navy text-immoo-navy/70 font-medium px-6 py-3"
            >
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
                  <CardTitle className="text-2xl text-immoo-navy flex items-center">
                    <Building className="h-6 w-6 mr-3 text-immoo-gold" />
                    À propos de l'agence
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-immoo-gray leading-relaxed text-lg mb-8">
                    {agency.description || "Aucune description disponible pour cette agence."}
                  </p>
                  
                  <Separator className="my-8 bg-immoo-gray/20" />
                  
                  <div className="space-y-6">
                    {agency.email && (
                      <div className="flex items-center gap-4 p-4 bg-immoo-pearl/30 rounded-xl">
                        <div className="bg-immoo-gold/20 p-3 rounded-lg">
                          <Mail className="h-5 w-5 text-immoo-navy" />
                        </div>
                        <span className="text-immoo-navy font-medium">{agency.email}</span>
                      </div>
                    )}
                    
                    {agency.website && (
                      <div className="flex items-center gap-4 p-4 bg-immoo-pearl/30 rounded-xl">
                        <div className="bg-immoo-gold/20 p-3 rounded-lg">
                          <Globe className="h-5 w-5 text-immoo-navy" />
                        </div>
                        <a 
                          href={agency.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-immoo-navy font-medium hover:text-immoo-gold transition-colors flex items-center"
                        >
                          {agency.website}
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </a>
                      </div>
                    )}
                    
                    {agency.serviceAreas && agency.serviceAreas.length > 0 && (
                      <div className="p-4 bg-immoo-pearl/30 rounded-xl">
                        <h3 className="text-immoo-navy font-semibold mb-4 flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-immoo-gold" />
                          Zones de service
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {agency.serviceAreas.map((area, index) => (
                            <Badge 
                              key={index} 
                              className="bg-immoo-gold/20 text-immoo-navy border-immoo-gold/30 px-3 py-1"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {agency.specialties && agency.specialties.length > 0 && (
                      <div className="p-4 bg-immoo-pearl/30 rounded-xl">
                        <h3 className="text-immoo-navy font-semibold mb-4 flex items-center">
                          <Star className="h-5 w-5 mr-2 text-immoo-gold" />
                          Spécialités
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {agency.specialties.map((specialty, index) => (
                            <Badge 
                              key={index} 
                              className="bg-immoo-navy text-immoo-pearl px-3 py-1"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
                    <CardTitle className="text-xl text-immoo-navy flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-immoo-gold" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-immoo-pearl/20 rounded-lg">
                        <div className="w-2 h-2 bg-immoo-gold rounded-full"></div>
                        <span className="text-sm text-immoo-navy">Nouvelle propriété ajoutée</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-immoo-pearl/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-immoo-navy">Bail signé</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-immoo-pearl/20 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-immoo-navy">Paiement reçu</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
                    <CardTitle className="text-xl text-immoo-navy flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-immoo-gold" />
                      Rendez-vous
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-4">
                      <Calendar className="h-12 w-12 text-immoo-gray mx-auto mb-3" />
                      <p className="text-immoo-gray">Aucun rendez-vous prévu</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="mt-8 bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-immoo-navy flex items-center">
                    <Home className="h-6 w-6 mr-3 text-immoo-gold" />
                    Propriétés récentes
                  </CardTitle>
                  <CardDescription className="text-immoo-gray">
                    Les dernières propriétés ajoutées par cette agence
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-immoo-navy" 
                  asChild
                >
                  <Link to={`/agencies/${agencyId}/properties`}>Voir toutes</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                {isLoadingProperties ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gradient-to-r from-immoo-gold/20 to-immoo-navy/20 rounded-xl mb-4"></div>
                        <div className="h-4 bg-immoo-gray/30 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-immoo-gray/30 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <PropertyList properties={properties.slice(0, 3)} agencyId={agencyId} />
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Home className="h-12 w-12 text-immoo-navy" />
                    </div>
                    <h3 className="text-2xl font-semibold text-immoo-navy mb-3">Aucune propriété</h3>
                    <p className="text-immoo-gray mb-6 max-w-md mx-auto">
                      Cette agence n'a pas encore ajouté de propriétés. Commencez par ajouter votre première propriété.
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-immoo-gold to-immoo-navy hover:from-immoo-navy hover:to-immoo-gold text-white px-8 py-3" 
                      asChild
                    >
                      <Link to={`/agencies/${agencyId}/properties/create`}>
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter une propriété
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card className="bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-immoo-navy flex items-center">
                    <Home className="h-6 w-6 mr-3 text-immoo-gold" />
                    Toutes les propriétés
                  </CardTitle>
                  <CardDescription className="text-immoo-gray">
                    Gérez les propriétés de l'agence {agency.name}
                  </CardDescription>
                </div>
                <Button 
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-immoo-navy font-semibold px-6 py-3" 
                  asChild
                >
                  <Link to={`/agencies/${agencyId}/properties/create`}>
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter une propriété
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                {isLoadingProperties ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gradient-to-r from-immoo-gold/20 to-immoo-navy/20 rounded-xl mb-4"></div>
                        <div className="h-4 bg-immoo-gray/30 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-immoo-gray/30 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <PropertyList properties={properties} agencyId={agencyId} />
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Home className="h-12 w-12 text-immoo-navy" />
                    </div>
                    <h3 className="text-2xl font-semibold text-immoo-navy mb-3">Aucune propriété</h3>
                    <p className="text-immoo-gray mb-6 max-w-md mx-auto">
                      Cette agence n'a pas encore ajouté de propriétés. Commencez par ajouter votre première propriété.
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-immoo-gold to-immoo-navy hover:from-immoo-navy hover:to-immoo-gold text-white px-8 py-3" 
                      asChild
                    >
                      <Link to={`/agencies/${agencyId}/properties/create`}>
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter une propriété
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card className="bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-immoo-navy flex items-center">
                    <Users className="h-6 w-6 mr-3 text-immoo-gold" />
                    Locataires
                  </CardTitle>
                  <CardDescription className="text-immoo-gray">
                    Gérez les locataires associés à cette agence
                  </CardDescription>
                </div>
                <Button 
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-immoo-navy font-semibold px-6 py-3" 
                  asChild
                >
                  <Link to={`/agencies/${agencyId}/tenants`}>
                    <Users className="h-5 w-5 mr-2" />
                    Gérer les locataires
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-12 w-12 text-immoo-navy" />
                  </div>
                  <h3 className="text-2xl font-semibold text-immoo-navy mb-3">Gestion des locataires</h3>
                  <p className="text-immoo-gray mb-6 max-w-md mx-auto">
                    Gérez les locataires et les baux pour toutes les propriétés de votre agence.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-immoo-gold to-immoo-navy hover:from-immoo-navy hover:to-immoo-gold text-white px-8 py-3" 
                    asChild
                  >
                    <Link to={`/agencies/${agencyId}/tenants`}>
                      Accéder à la gestion des locataires
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <Card className="bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
                <CardTitle className="text-2xl text-immoo-navy flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-immoo-gold" />
                  Statistiques
                </CardTitle>
                <CardDescription className="text-immoo-gray">
                  Aperçu des performances de l'agence
                </CardDescription>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-immoo-gold/20 to-immoo-navy/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-immoo-navy" />
                  </div>
                  <h3 className="text-2xl font-semibold text-immoo-navy mb-3">Statistiques détaillées</h3>
                  <p className="text-immoo-gray mb-6 max-w-md mx-auto">
                    Consultez les rapports et analyses pour cette agence. Cette fonctionnalité sera bientôt disponible.
                  </p>
                  <Button 
                    disabled 
                    className="bg-immoo-gray/30 text-immoo-gray px-8 py-3"
                  >
                    Fonctionnalité en développement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

