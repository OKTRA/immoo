import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById, getAgencyStatistics } from "@/services/agency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Home,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  Building2,
  Star,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Agency } from "@/assets/types";

export default function AgencyAnalyticsPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      toast.error(t('analytics.loadError'));
      navigate("/my-agencies");
    }
  }, [agencyError, navigate, t]);

  const agency: Agency | null = agencyData?.agency || null;
  
  // Statistiques avec fallback en cas d'erreur
  const stats = (statsData as any)?.statistics || {
    propertiesCount: 0,
    avgRating: 0,
    recentListings: []
  };

  if (isLoadingAgency) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('analytics.agencyNotFound')}
          </h2>
          <p className="text-gray-600 mb-4">{t('analytics.agencyNotFoundDesc')}</p>
          <Button asChild>
            <Link to="/my-agencies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('navigation.backToAgencies')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/agencies/${agencyId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('navigation.back')}
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border overflow-hidden bg-gray-100">
                  {agency.logoUrl ? (
                    <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-immoo-gold">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{agency.name}</h1>
                    {agency.verified && <Badge variant="secondary" className="text-xs">{t('common.verified')}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{t('analytics.pageTitle')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-immoo-gold" />
              <span className="font-medium text-immoo-gold">{t('analytics.title')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('analytics.totalProperties')}</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.propertiesCount}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {t('analytics.thisMonth')}
                  </p>
                </div>
                <Home className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('analytics.averageRating')}</p>
                  <p className="text-3xl font-bold text-green-600">{stats.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Star className="w-3 h-3 mr-1" />
                    {t('analytics.outOfFive')}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('analytics.totalViews')}</p>
                  <p className="text-3xl font-bold text-purple-600">2,847</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% {t('analytics.thisWeek')}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('analytics.performance')}</p>
                  <p className="text-3xl font-bold text-orange-600">98%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Activity className="w-3 h-3 mr-1" />
                    {t('analytics.excellent')}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique des vues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                {t('analytics.viewsOverTime')}
              </CardTitle>
              <CardDescription>{t('analytics.viewsOverTimeDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{t('analytics.chartComingSoon')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Répartition des propriétés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-500" />
                {t('analytics.propertyDistribution')}
              </CardTitle>
              <CardDescription>{t('analytics.propertyDistributionDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{t('analytics.chartComingSoon')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Propriétés récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              {t('analytics.recentListings')}
            </CardTitle>
            <CardDescription>{t('analytics.recentListingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : stats.recentListings && stats.recentListings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentListings.map((property: any, index: number) => (
                  <div key={property.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-immoo-gold rounded flex items-center justify-center">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{property.title || t('analytics.untitledProperty')}</h4>
                        <p className="text-sm text-gray-600">{property.location || t('analytics.noLocation')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{property.price ? `${property.price.toLocaleString()} FCFA` : t('analytics.priceNotSet')}</p>
                      <p className="text-sm text-gray-600">{property.created_at ? new Date(property.created_at).toLocaleDateString() : t('analytics.noDate')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">{t('analytics.noRecentListings')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/agencies/${agencyId}/properties`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Home className="w-8 h-8 text-immoo-gold mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{t('analytics.manageProperties')}</h3>
                <p className="text-sm text-gray-600">{t('analytics.managePropertiesDesc')}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={`/agencies/${agencyId}/tenants`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-immoo-gold mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{t('analytics.manageTenants')}</h3>
                <p className="text-sm text-gray-600">{t('analytics.manageTenantsDesc')}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={`/agencies/${agencyId}/payments`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-immoo-gold mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{t('analytics.viewPayments')}</h3>
                <p className="text-sm text-gray-600">{t('analytics.viewPaymentsDesc')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
