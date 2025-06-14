
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
  MapPin
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
      <div className="container mx-auto py-16">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="text-center p-8">
          <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Agence non trouvée</CardTitle>
            <CardDescription>
              Cette agence n'existe pas ou a été supprimée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/agencies")}>
              Retour à la liste des agences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-lg border overflow-hidden bg-background">
              {agency.logoUrl ? (
                <img 
                  src={agency.logoUrl} 
                  alt={agency.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            {agency.verified && (
              <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1">
                <Badge variant="outline" className="bg-background">Vérifié</Badge>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              {agency.name}
            </h1>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{agency.location}</span>
            </div>
            {agency.phone && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-1" />
                <span>{agency.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" asChild>
            <Link to={`/agencies/${agencyId}/properties/create`}>
              <Home className="h-4 w-4 mr-2" />
              Ajouter une propriété
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/agencies/${agencyId}/tenants`}>
              <Users className="h-4 w-4 mr-2" />
              Gérer les locataires
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="properties">Propriétés</TabsTrigger>
          <TabsTrigger value="tenants">Locataires</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>À propos de l'agence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {agency.description || "Aucune description disponible pour cette agence."}
                </p>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  {agency.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{agency.email}</span>
                    </div>
                  )}
                  
                  {agency.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                        {agency.website}
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {agency.serviceAreas && agency.serviceAreas.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Zones de service</h3>
                      <div className="flex flex-wrap gap-1">
                        {agency.serviceAreas.map((area, index) => (
                          <Badge variant="secondary" key={index} className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {agency.specialties && agency.specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Spécialités</h3>
                      <div className="flex flex-wrap gap-1">
                        {agency.specialties.map((specialty, index) => (
                          <Badge key={index} className="text-xs">
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Chiffres clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <span>Propriétés</span>
                      </div>
                      <span className="font-semibold">{propertiesCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <span>Note moyenne</span>
                      </div>
                      <span className="font-semibold">{agency.rating.toFixed(1)}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Propriétés récentes</CardTitle>
                <CardDescription>Les dernières propriétés ajoutées par cette agence</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to={`/agencies/${agencyId}/properties`}>Voir toutes</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingProperties ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-40 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <PropertyList properties={properties.slice(0, 3)} agencyId={agencyId} />
              ) : (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune propriété</h3>
                  <p className="text-muted-foreground mb-4">
                    Cette agence n'a pas encore ajouté de propriétés
                  </p>
                  <Button asChild>
                    <Link to={`/agencies/${agencyId}/properties/create`}>
                      Ajouter une propriété
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Toutes les propriétés</CardTitle>
                <CardDescription>
                  Gérez les propriétés de l'agence {agency.name}
                </CardDescription>
              </div>
              <Button asChild>
                <Link to={`/agencies/${agencyId}/properties/create`}>
                  Ajouter une propriété
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingProperties ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-40 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <PropertyList properties={properties} agencyId={agencyId} />
              ) : (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune propriété</h3>
                  <p className="text-muted-foreground mb-4">
                    Cette agence n'a pas encore ajouté de propriétés
                  </p>
                  <Button asChild>
                    <Link to={`/agencies/${agencyId}/properties/create`}>
                      Ajouter une propriété
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Locataires</CardTitle>
                <CardDescription>
                  Gérez les locataires associés à cette agence
                </CardDescription>
              </div>
              <Button asChild>
                <Link to={`/agencies/${agencyId}/tenants`}>
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les locataires
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Gestion des locataires</h3>
                <p className="text-muted-foreground mb-4">
                  Gérez les locataires et les baux pour toutes les propriétés
                </p>
                <Button variant="default" asChild>
                  <Link to={`/agencies/${agencyId}/tenants`}>
                    Accéder à la gestion des locataires
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>
                Aperçu des performances de l'agence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Statistiques détaillées</h3>
                <p className="text-muted-foreground mb-4">
                  Consultez les rapports et analyses pour cette agence
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
  );
}

