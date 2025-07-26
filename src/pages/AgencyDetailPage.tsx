import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
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
  Activity,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Zap,
  Crown,
  Sparkles,
  Award,
  Shield,
  Rocket,
  Receipt,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Edit
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Agency } from "@/assets/types";
import PropertyList from "@/components/properties/PropertyList";
import { formatCurrency } from "@/lib/utils";
// Import des pages
import AgencyPropertiesPage from "@/pages/AgencyPropertiesPage";
import AgencyLeasesPage from "@/pages/AgencyLeasesPage";

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Déterminer l'onglet actif basé sur l'URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/properties')) return 'properties';
    if (path.includes('/tenants')) return 'tenants';
    if (path.includes('/leases')) return 'leases';
    if (path.includes('/statistics')) return 'statistics';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());

  // Synchroniser l'onglet avec l'URL quand elle change
  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);
  }, [location.pathname]);

  const { 
    data: agencyData, 
    isLoading: isLoadingAgency, 
    error: agencyError 
  } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { 
    data: propertiesData, 
    isLoading: isLoadingProperties
  } = useQuery({
    queryKey: ['agency-properties', agencyId],
    queryFn: () => getPropertiesByAgencyId(agencyId || ''),
    enabled: !!agencyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: statsData, 
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['agency-stats', agencyId],
    queryFn: () => getAgencyStatistics(agencyId || ''),
    enabled: !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    
    // Navigation sans replace pour éviter les problèmes de cache
    if (value === "overview") {
      navigate(`/agencies/${agencyId}`);
    } else {
      navigate(`/agencies/${agencyId}/${value}`);
    }
  };

  // Si on est sur la page properties, on rend directement AgencyPropertiesPage
  if (location.pathname.includes('/properties') && !location.pathname.includes('/create')) {
    return <AgencyPropertiesPage />;
  }

  // Si on est sur la page leases, on rend directement AgencyLeasesPage
  if (location.pathname.includes('/leases')) {
    return <AgencyLeasesPage />;
  }

  if (isLoadingAgency) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-white rounded-xl shadow-sm"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white rounded-xl shadow-sm"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-white rounded-xl shadow-sm"></div>
              <div className="h-96 bg-white rounded-xl shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md mx-auto shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-red-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-xl">Agence introuvable</CardTitle>
            <CardDescription>Cette agence n'existe pas ou a été supprimée</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/agencies")}
              className="bg-immoo-navy hover:bg-immoo-navy/90"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Retour aux agences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header moderne avec subtilité */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              {/* Logo avec effet subtil */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl border-2 border-slate-100 overflow-hidden bg-slate-50 shadow-md">
                  {agency.logoUrl ? (
                    <img 
                      src={agency.logoUrl} 
                      alt={agency.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-immoo-gold to-amber-400">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                {agency.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 shadow-lg">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* Infos élégantes */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {agency.name}
                  </h1>
                  {agency.verified && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Certifiée
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-slate-600 mt-1">
                  <MapPin className="h-4 w-4 mr-2 text-immoo-gold" />
                  <span>{agency.location}</span>
                </div>
              </div>
            </div>
            
            {/* Actions avec style */}
            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-immoo-gold to-amber-400 hover:from-amber-400 hover:to-immoo-gold text-black font-medium shadow-lg"
                asChild
              >
                <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle propriété
                </RouterLink>
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-300 hover:bg-slate-50"
                asChild
              >
                <RouterLink to={`/agencies/${agencyId}/tenants`}>
                  <Users className="h-4 w-4 mr-2" />
                  Locataires
                </RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Statistiques avec design moderne mais sobre */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Propriétés */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Propriétés</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{propertiesCount}</p>
                  <div className="flex items-center mt-2 text-emerald-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">+8% ce mois</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note moyenne */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{agency.rating?.toFixed(1) || '4.8'}</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < (agency.rating || 4.8) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vues */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Vues ce mois</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">2,847</p>
                  <div className="flex items-center mt-2 text-emerald-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">+24%</span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Performance</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">98%</p>
                  <div className="flex items-center mt-2 text-purple-600">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="text-xs">Excellent</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation élégante */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="bg-white border border-slate-200 shadow-sm p-1 grid grid-cols-5 w-full">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Sparkles className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Building2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Propriétés</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tenants" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Locataires</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leases" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Receipt className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Baux</span>
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section principale avec design soigné */}
              <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
                  <CardTitle className="text-xl flex items-center">
                    <div className="bg-immoo-gold p-2 rounded-lg mr-3">
                      <Building className="h-5 w-5 text-black" />
                    </div>
                    À propos de l'agence
                  </CardTitle>
                  <CardDescription>Informations détaillées et services proposés</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 leading-relaxed mb-6">
                    {agency.description || "Une agence immobilière de confiance, spécialisée dans la gestion et la location de biens immobiliers de qualité. Notre équipe expérimentée vous accompagne dans tous vos projets immobiliers."}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  {/* Informations de contact avec style */}
                  <div className="space-y-4">
                    {agency.email && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Email professionnel</p>
                          <p className="font-medium text-slate-900">{agency.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {agency.website && (
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="bg-emerald-500 p-2 rounded-lg">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-600">Site web</p>
                          <a 
                            href={agency.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-medium text-slate-900 hover:text-emerald-600 transition-colors flex items-center"
                          >
                            {agency.website}
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {agency.serviceAreas && agency.serviceAreas.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center mb-3">
                          <div className="bg-amber-500 p-2 rounded-lg mr-3">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <p className="font-medium text-slate-900">Zones de service</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {agency.serviceAreas.map((area, index) => (
                            <Badge 
                              key={index} 
                              className="bg-amber-100 text-amber-800 border-amber-200"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {agency.specialties && agency.specialties.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center mb-3">
                          <div className="bg-purple-500 p-2 rounded-lg mr-3">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                          <p className="font-medium text-slate-900">Spécialités</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {agency.specialties.map((specialty, index) => (
                            <Badge 
                              key={index} 
                              className="bg-purple-600 text-white"
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
              
              {/* Sidebar avec design cohérent */}
              <div className="space-y-6">
                {/* Activité récente */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-immoo-gold" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Nouvelle propriété ajoutée</p>
                        <p className="text-xs text-slate-500">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Bail signé</p>
                        <p className="text-xs text-slate-500">Il y a 4 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Paiement reçu</p>
                        <p className="text-xs text-slate-500">Il y a 6 heures</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions rapides avec style */}
                <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-amber-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-immoo-gold" />
                      Actions rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline"
                      className="w-full justify-start hover:bg-immoo-gold hover:text-black transition-colors"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une propriété
                      </RouterLink>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full justify-start hover:bg-slate-100"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/tenants`}>
                        <Users className="h-4 w-4 mr-2" />
                        Gérer les locataires
                      </RouterLink>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full justify-start hover:bg-slate-100"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/payments`}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Paiements
                      </RouterLink>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Home className="h-5 w-5 mr-2 text-immoo-gold" />
                    Toutes les propriétés
                  </CardTitle>
                  <CardDescription>
                    Gérez les propriétés de l'agence {agency.name}
                  </CardDescription>
                </div>
                <Button 
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-black"
                  asChild
                >
                  <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une propriété
                  </RouterLink>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingProperties ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-slate-200 rounded-lg mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <PropertyList properties={properties} agencyId={agencyId} />
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-slate-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Home className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune propriété</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Cette agence n'a pas encore ajouté de propriétés.
                    </p>
                    <Button 
                      className="bg-immoo-gold hover:bg-immoo-gold/90 text-black"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une propriété
                      </RouterLink>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Users className="h-5 w-5 mr-2 text-immoo-gold" />
                    Locataires
                  </CardTitle>
                  <CardDescription>
                    Gérez les locataires associés à cette agence
                  </CardDescription>
                </div>
                <Button 
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-black"
                  asChild
                >
                  <RouterLink to={`/agencies/${agencyId}/tenants`}>
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les locataires
                  </RouterLink>
                </Button>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="bg-slate-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Gestion des locataires</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Gérez les locataires et les baux pour toutes les propriétés.
                  </p>
                  <Button 
                    className="bg-immoo-navy hover:bg-immoo-navy/90"
                    asChild
                  >
                    <RouterLink to={`/agencies/${agencyId}/tenants`}>
                      Accéder à la gestion
                    </RouterLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leases">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-immoo-gold" />
                    Baux
                  </CardTitle>
                  <CardDescription>
                    Gérez les baux de l'agence
                  </CardDescription>
                </div>
                <Button 
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-black"
                  asChild
                >
                  <RouterLink to={`/agencies/${agencyId}/leases`}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Gérer les baux
                  </RouterLink>
                </Button>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="bg-slate-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Receipt className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Gestion des baux</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Gérez les baux et les paiements pour toutes les propriétés.
                  </p>
                  <Button 
                    className="bg-immoo-navy hover:bg-immoo-navy/90"
                    asChild
                  >
                    <RouterLink to={`/agencies/${agencyId}/leases`}>
                      Accéder à la gestion
                    </RouterLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-immoo-gold" />
                  Statistiques
                </CardTitle>
                <CardDescription>
                  Aperçu des performances de l'agence
                </CardDescription>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="bg-slate-50 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Statistiques détaillées</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Cette fonctionnalité sera bientôt disponible.
                  </p>
                  <Button disabled variant="outline">
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

