import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById, getPropertiesByAgencyId, getAgencyStatistics, getAgencyViewsTrend } from "@/services/agency";
import { useViewTracking } from "@/services/analytics/viewTrackingService";
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
import { useTranslation } from "@/hooks/useTranslation";
// Import des pages
import AgencyPropertiesPage from "@/pages/AgencyPropertiesPage";
import AgencyLeasesPage from "@/pages/AgencyLeasesPage";

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
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

  const { data: statisticsData, isLoading: isLoadingStatistics } = useQuery({
    queryKey: ['agency-statistics', agencyId],
    queryFn: () => getAgencyStatistics(agencyId!),
    enabled: !!agencyId,
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
  const stats = statsData?.statistics || {};
  const statisticsStats = statisticsData?.statistics;
  const viewsTrend = statisticsStats ? getAgencyViewsTrend(statisticsStats.viewsThisMonth, statisticsStats.viewsLastMonth) : '+0%';

  // Enregistrer la vue de l'agence
  useViewTracking('agency', agencyId);

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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Agence non trouvée</h1>
          <p className="text-slate-600 mb-6">L'agence que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate("/agencies")}>
            Retour aux agences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec design moderne */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            
            {/* Actions avec style */}
            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-immoo-gold to-amber-400 hover:from-amber-400 hover:to-immoo-gold text-black font-medium shadow-lg"
                asChild
              >
                <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('agencyDashboard.pages.overview.newProperty')}
                </RouterLink>
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-300 hover:bg-slate-50"
                asChild
              >
                <RouterLink to={`/agencies/${agencyId}/tenants`}>
                  <Users className="h-4 w-4 mr-2" />
                  {t('agencyDashboard.pages.overview.tenants')}
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
                  <p className="text-sm font-medium text-slate-600">{t('agencyDashboard.pages.overview.properties')}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{propertiesCount}</p>
                  <div className="flex items-center mt-2 text-emerald-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">+8% {t('agencyDashboard.pages.overview.thisMonth')}</span>
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
                  <p className="text-sm font-medium text-slate-600">{t('agencyDashboard.pages.overview.averageRating')}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isLoadingStatistics ? '...' : (statisticsStats?.averageRating > 0 ? statisticsStats.averageRating.toFixed(1) : '0.0')}
                  </p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < (statisticsStats?.averageRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
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
                  <p className="text-sm font-medium text-slate-600">{t('agencyDashboard.pages.overview.viewsThisMonth')}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isLoadingStatistics ? '...' : (statisticsStats?.viewsThisMonth?.toLocaleString() || '0')}
                  </p>
                  <div className="flex items-center mt-2 text-emerald-600">
                    {viewsTrend.startsWith('+') ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : viewsTrend.startsWith('-') ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    <span className="text-xs">{viewsTrend}</span>
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
                  <p className="text-sm font-medium text-slate-600">{t('agencyDashboard.pages.overview.performance')}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {isLoadingStatistics ? '...' : `${statisticsStats?.performance || 0}%`}
                  </p>
                  <div className="flex items-center mt-2 text-purple-600">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      {(statisticsStats?.performance || 0) >= 90 ? t('agencyDashboard.pages.overview.excellent') : 
                       (statisticsStats?.performance || 0) >= 70 ? 'Bon' : 
                       (statisticsStats?.performance || 0) >= 50 ? 'Moyen' : 'À améliorer'}
                    </span>
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
              <span className="hidden sm:inline">{t('agencyDashboard.pages.overview.title')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Building2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('agencyDashboard.pages.overview.properties')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tenants" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('agencyDashboard.pages.overview.tenants')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leases" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <Receipt className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('agencyDashboard.sidebar.leases')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="data-[state=active]:bg-immoo-gold data-[state=active]:text-black data-[state=active]:shadow-sm flex items-center justify-center px-2 sm:px-4"
            >
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('agencyDashboard.sidebar.analytics')}</span>
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
                    {t('agencyDashboard.pages.overview.aboutAgency')}
                  </CardTitle>
                  <CardDescription>{t('agencyDashboard.pages.overview.detailedInfo')}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 leading-relaxed mb-6">
                    {agency.description || t('agencyDashboard.pages.overview.trustedAgencyDescription')}
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
                          <p className="text-xs text-slate-600">{t('agencyDashboard.pages.overview.professionalEmail')}</p>
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
                          <p className="text-xs text-slate-600">{t('agencyDashboard.pages.overview.website')}</p>
                          <a 
                            href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} 
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
                          <p className="font-medium text-slate-900">{t('agencyDashboard.pages.overview.serviceAreas')}</p>
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
                          <p className="font-medium text-slate-900">{t('agencyDashboard.pages.overview.specialties')}</p>
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
                      {t('agencyDashboard.pages.overview.recentActivity')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{t('agencyDashboard.pages.overview.newPropertyAdded')}</p>
                        <p className="text-xs text-slate-500">{t('agencyDashboard.pages.overview.hoursAgo', { count: 2 })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{t('agencyDashboard.pages.overview.leaseSigned')}</p>
                        <p className="text-xs text-slate-500">{t('agencyDashboard.pages.overview.hoursAgo', { count: 4 })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{t('agencyDashboard.pages.overview.paymentReceived')}</p>
                        <p className="text-xs text-slate-500">{t('agencyDashboard.pages.overview.hoursAgo', { count: 6 })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions rapides avec style */}
                <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-amber-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-immoo-gold" />
                      {t('agencyDashboard.pages.overview.quickActions')}
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
                        {t('agencyDashboard.pages.overview.addProperty')}
                      </RouterLink>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full justify-start hover:bg-slate-100"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/tenants`}>
                        <Users className="h-4 w-4 mr-2" />
                        {t('agencyDashboard.pages.overview.manageTenants')}
                      </RouterLink>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full justify-start hover:bg-slate-100"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/payments`}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        {t('agencyDashboard.pages.overview.payments')}
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
                    {t('agencyDashboard.pages.overview.allProperties')}
                  </CardTitle>
                  <CardDescription>
                    {t('agencyDashboard.pages.overview.manageAgencyProperties')} {agency.name}
                  </CardDescription>
                </div>
                <Button 
                  className="bg-immoo-gold hover:bg-immoo-gold/90 text-black"
                  asChild
                >
                  <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('agencyDashboard.pages.overview.addNewProperty')}
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
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('agencyDashboard.pages.overview.noProperties')}</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      {t('agencyDashboard.pages.overview.noPropertiesDescription')}
                    </p>
                    <Button 
                      className="bg-immoo-gold text-black hover:bg-immoo-gold/90"
                      asChild
                    >
                      <RouterLink to={`/agencies/${agencyId}/properties/create`}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('agencyDashboard.pages.overview.addProperty')}
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

