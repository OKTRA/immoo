import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  Target
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Property } from '@/assets/types';
import { getProperties } from '@/services/propertyService';
import { useTranslation } from 'react-i18next';
import PropertyCard from '@/components/PropertyCard';
import SaleActionDropdown from '@/components/sales/SaleActionDropdown';
import { SaleStatusBadge } from '@/utils/saleStatusUtils';

// Nouveaux composants analytics
import SalesKPICards from '@/components/analytics/SalesKPICards';
import SalesPerformanceChart from '@/components/analytics/SalesPerformanceChart';
import SalesPriceDistribution from '@/components/analytics/SalesPriceDistribution';
import SalesVelocityChart from '@/components/analytics/SalesVelocityChart';

// Nouveaux services
import {
  getAgencySalesStats,
  getSalesPerformanceMetrics,
  getPropertyMarketingData,
  AgencySalesStats,
  SalesPerformanceMetrics,
  PropertyMarketingData
} from '@/services/sales/agencySalesAnalyticsService';

interface SaleStats {
  totalForSale: number;
  totalValue: number;
  averagePrice: number;
  pendingSales: number;
}

export default function AgencySalesPage() {
  const { agencyId } = useParams();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);
  
  // États pour les filtres des propriétés
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Requêtes pour les données analytics
  const { 
    data: salesStats, 
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['agency-sales-stats', agencyId, refreshKey],
    queryFn: () => getAgencySalesStats(agencyId || ''),
    enabled: !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const { 
    data: performanceMetrics, 
    isLoading: isLoadingPerformance,
    refetch: refetchPerformance
  } = useQuery({
    queryKey: ['sales-performance', agencyId, selectedYear, refreshKey],
    queryFn: () => getSalesPerformanceMetrics(agencyId || '', selectedYear),
    enabled: !!agencyId,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const { 
    data: marketingData, 
    isLoading: isLoadingMarketing,
    refetch: refetchMarketing
  } = useQuery({
    queryKey: ['property-marketing', agencyId, refreshKey],
    queryFn: () => getPropertyMarketingData(agencyId || ''),
    enabled: !!agencyId,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Chargement des propriétés pour la vue liste
  useEffect(() => {
    loadSaleProperties();
  }, [agencyId]);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, priceFilter, statusFilter]);

  const loadSaleProperties = async () => {
    if (!agencyId) return;
    
    try {
      const { properties: allProperties } = await getProperties(agencyId);
      
      // Filtrer seulement les propriétés en vente
      const saleProperties = allProperties.filter(property => {
        const isForSale = (property.features || []).includes('for_sale');
        return isForSale;
      });

      setProperties(saleProperties);
    } catch (error) {
      console.error('Error loading sale properties:', error);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    // Filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre de prix
    if (priceFilter !== 'all') {
      filtered = filtered.filter(property => {
        const price = property.price || 0;
        switch (priceFilter) {
          case 'under-10m': return price < 10000000;
          case '10m-25m': return price >= 10000000 && price < 25000000;
          case '25m-50m': return price >= 25000000 && price < 50000000;
          case 'over-50m': return price >= 50000000;
          default: return true;
        }
      });
    }

    // Filtre de statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    setFilteredProperties(filtered);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    loadSaleProperties();
  };

  const years = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2
  ];

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard des Ventes</h1>
          <p className="text-muted-foreground">
            Analysez et suivez les performances de vos ventes immobilières
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoadingStats || isLoadingPerformance}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats || isLoadingPerformance ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Gestion des erreurs */}
      {statsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Erreur lors du chargement des données: {(statsError as Error).message}</span>
              <Button variant="outline" size="sm" onClick={() => refetchStats()}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Propriétés
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Marketing
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principaux */}
          <SalesKPICards 
            stats={salesStats || {
              totalForSale: 0,
              totalValue: 0,
              averagePrice: 0,
              pendingSales: 0,
              completedSales: 0,
              cancelledSales: 0,
              totalRevenue: 0,
              totalCommissions: 0,
              averageCommissionRate: 0,
              averageDaysOnMarket: 0,
              conversionRate: 0
            }}
            marketComparison={performanceMetrics?.marketComparison}
            isLoading={isLoadingStats}
          />

          {/* Graphique de performance mensuelle */}
          <SalesPerformanceChart 
            data={performanceMetrics?.monthlyData || []}
            isLoading={isLoadingPerformance}
          />

          {/* Distribution des prix et vélocité */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesPriceDistribution 
              data={performanceMetrics?.priceDistribution || []}
              isLoading={isLoadingPerformance}
            />
          </div>
        </TabsContent>

        {/* Analytics avancées */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Vélocité des ventes */}
          <SalesVelocityChart 
            velocityData={performanceMetrics?.salesVelocity || []}
            marketComparison={performanceMetrics?.marketComparison}
            isLoading={isLoadingPerformance}
          />

          {/* Données trimestrielles et annuelles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance trimestrielle {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPerformance ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {performanceMetrics?.quarterlyData.map((quarter, index) => (
                      <div key={quarter.period} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{quarter.period}</div>
                          <div className="text-sm text-muted-foreground">{quarter.sales} ventes</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(quarter.revenue)}</div>
                          <div className="text-sm text-muted-foreground">
                            {quarter.growth > 0 ? '+' : ''}{quarter.growth.toFixed(1)}% croissance
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution annuelle</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPerformance ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {performanceMetrics?.yearlyData.map((year, index) => (
                      <div key={year.year} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{year.year}</div>
                          <div className="text-sm text-muted-foreground">{year.sales} ventes</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(year.revenue)}</div>
                          <div className="text-sm text-muted-foreground">
                            {year.growth > 0 ? '+' : ''}{year.growth.toFixed(1)}% vs année précédente
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Liste des propriétés */}
        <TabsContent value="properties" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par titre ou localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les prix</SelectItem>
                    <SelectItem value="under-10m">Moins de 10M FCFA</SelectItem>
                    <SelectItem value="10m-25m">10M - 25M FCFA</SelectItem>
                    <SelectItem value="25m-50m">25M - 50M FCFA</SelectItem>
                    <SelectItem value="over-50m">Plus de 50M FCFA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="pending">En négociation</SelectItem>
                    <SelectItem value="sold">Vendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des propriétés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard property={property} />
                <div className="absolute top-2 right-2">
                  <SaleActionDropdown 
                    property={property}
                    agencyId={agencyId || ''}
                    onPropertyUpdate={loadSaleProperties}
                  />
                </div>
              </div>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune propriété trouvée</h3>
                <p className="text-gray-600 mb-4">
                  Aucune propriété ne correspond à vos critères de recherche.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setPriceFilter('all');
                  setStatusFilter('all');
                }}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Marketing des propriétés */}
        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Marketing des Propriétés</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMarketing ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-3">Propriété</th>
                        <th className="text-right py-3 px-3">Prix</th>
                        <th className="text-right py-3 px-3">Jours en ligne</th>
                        <th className="text-right py-3 px-3">Vues</th>
                        <th className="text-right py-3 px-3">Demandes</th>
                        <th className="text-center py-3 px-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketingData?.map((property) => (
                        <tr key={property.id} className="border-b">
                          <td className="py-3 px-3">
                            <div>
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Listé le {new Date(property.listedDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-3">{formatCurrency(property.price)}</td>
                          <td className="text-right py-3 px-3">{property.daysOnMarket}</td>
                          <td className="text-right py-3 px-3">{property.viewCount}</td>
                          <td className="text-right py-3 px-3">{property.inquiries}</td>
                          <td className="text-center py-3 px-3">
                            <SaleStatusBadge status={property.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}