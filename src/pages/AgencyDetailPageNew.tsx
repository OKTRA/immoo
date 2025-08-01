import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById, getPropertiesByAgencyId, getAgencyStatistics } from "@/services/agency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  MapPin,
  Star,
  Eye,
  Plus,
  Activity,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { Agency } from "@/assets/types";
import PropertyList from "@/components/properties/PropertyList";
import { formatWebsiteUrl } from "@/utils/urlUtils";

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Détecter l'onglet actuel depuis l'URL
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/analytics')) {
      setActiveTab('analytics');
    } else if (pathname.includes('/properties')) {
      setActiveTab('properties');
    } else if (pathname.includes('/tenants')) {
      setActiveTab('tenants');
    } else if (pathname.includes('/statistics')) {
      setActiveTab('analytics'); // statistics -> analytics
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

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
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['agency-stats', agencyId],
    queryFn: () => getAgencyStatistics(agencyId || ''),
    enabled: !!agencyId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000 // 5 minutes
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
  
  // Statistiques avec fallback en cas d'erreur
  const stats = (statsData as any)?.statistics || {
    propertiesCount: propertiesCount,
    avgRating: 0,
    recentListings: []
  };

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-6 max-w-md">
          <CardHeader>
            <CardTitle>Agence introuvable</CardTitle>
            <CardDescription>Cette agence n'existe pas ou a été supprimée</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/agencies")}>
              Retour aux agences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec photo d'agence mise en valeur */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow">
                {agency.logoUrl ? (
                  <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-immoo-gold to-yellow-500">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
                  {agency.verified && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">✓ Vérifiée</Badge>}
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {agency.location}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="bg-immoo-gold text-black hover:bg-immoo-gold/90" asChild>
                <Link to={`/agencies/${agencyId}/properties/create`}>
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle propriété
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/agencies/${agencyId}/tenants`}>
                  <Users className="w-4 h-4 mr-1" />
                  Locataires
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* Statistiques compactes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Propriétés</p>
                  <p className="text-xl font-semibold">{propertiesCount}</p>
                </div>
                <Building className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Note</p>
                  <p className="text-xl font-semibold">{agency.rating?.toFixed(1) || '4.8'}</p>
                </div>
                <Star className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vues</p>
                  <p className="text-xl font-semibold">2,847</p>
                </div>
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Performance</p>
                  <p className="text-xl font-semibold">98%</p>
                </div>
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation sobre */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="bg-white grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-immoo-gold flex items-center justify-center px-2 sm:px-4">
              <Eye className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-immoo-gold flex items-center justify-center px-2 sm:px-4">
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Propriétés</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-immoo-gold flex items-center justify-center px-2 sm:px-4">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Locataires</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-immoo-gold flex items-center justify-center px-2 sm:px-4">
              <BarChart3 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Building className="w-4 h-4 mr-2" />
                    À propos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {agency.description || "Agence immobilière spécialisée dans la gestion et la location de biens."}
                  </p>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    {agency.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{agency.email}</span>
                      </div>
                    )}
                    
                    {agency.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a href={formatWebsiteUrl(agency.website)} 
                           target="_blank" rel="noopener noreferrer" 
                           className="text-immoo-navy hover:underline flex items-center">
                          {agency.website}
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    {agency.serviceAreas && agency.serviceAreas.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Zones de service</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agency.serviceAreas.map((area, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Activity className="w-4 h-4 mr-2" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Nouvelle propriété ajoutée</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Bail signé</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Paiement reçu</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                      <Link to={`/agencies/${agencyId}/properties/create`}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter propriété
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                      <Link to={`/agencies/${agencyId}/tenants`}>
                        <Users className="w-4 h-4 mr-2" />
                        Gérer locataires
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                      <Link to={`/agencies/${agencyId}/payments`}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Paiements
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Propriétés</CardTitle>
                  <CardDescription>Gestion des biens de l'agence</CardDescription>
                </div>
                <Button className="bg-immoo-gold text-black hover:bg-immoo-gold/90" asChild>
                  <Link to={`/agencies/${agencyId}/properties/create`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingProperties ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <PropertyList properties={properties} agencyId={agencyId} />
                ) : (
                  <div className="text-center py-8">
                    <Home className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Aucune propriété</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Locataires</CardTitle>
                <CardDescription>Gestion des locataires</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">Gérez vos locataires</p>
                <Button asChild>
                  <Link to={`/agencies/${agencyId}/tenants`}>Accéder</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Analyses et rapports</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Fonctionnalité bientôt disponible</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 