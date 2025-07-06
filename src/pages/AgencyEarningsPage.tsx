import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText,
  Download,
  Building2,
  Home,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Filter,
  Search,
  ArrowUpDown,
  MapPin,
  Users,
  Wallet,
  Target,
  Percent
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAgencyEarnings, getEarningsByProperty, PropertyEarning } from "@/services/agency/agencyEarningsService";
import EarningsAnalytics from "@/components/analytics/EarningsAnalytics";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function AgencyEarningsPage() {
  const { agencyId } = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [granularity, setGranularity] = useState<'month' | 'year'>('month');

  const { data: earningsData, isLoading, error } = useQuery({
    queryKey: ['agency-earnings', agencyId, selectedPeriod, selectedYear],
    queryFn: () => getAgencyEarnings(agencyId!, selectedPeriod, selectedYear),
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
  });

  const { data: propertyEarnings, isLoading: isLoadingByProperty } = useQuery({
    queryKey: ['property-earnings', agencyId, selectedPeriod, selectedYear],
    queryFn: () => getEarningsByProperty(agencyId!, selectedPeriod, selectedYear),
    enabled: !!agencyId,
    refetchOnWindowFocus: false,
  });

  const earnings = earningsData?.earnings || [];
  const summary = earningsData?.summary || {
    totalEarnings: 0,
    commissionEarnings: 0,
    agencyFeeEarnings: 0,
    transactionCount: 0,
    averageCommissionRate: 0,
    paidEarnings: 0,
    pendingEarnings: 0
  };

  // Filtrer les gains selon les critères sélectionnés
  const filteredEarnings = earnings.filter(earning => {
    const matchesStatus = selectedStatus === 'all' || earning.status === selectedStatus;
    const matchesSearch = earning.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          earning.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculer les pourcentages
  const paidPercentage = summary.totalEarnings > 0 ? (summary.paidEarnings / summary.totalEarnings) * 100 : 0;
  const pendingPercentage = summary.totalEarnings > 0 ? (summary.pendingEarnings / summary.totalEarnings) * 100 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-immoo-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de vos gains...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des gains. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Premium */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-immoo-navy to-immoo-gold bg-clip-text text-transparent">
                Centre de Gains
              </h1>
              <p className="text-muted-foreground">
                Suivi en temps réel de vos commissions et revenus d'agence
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres Premium */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {[
                { value: 'month', label: 'Ce mois', icon: Calendar },
                { value: 'quarter', label: 'Trimestre', icon: BarChart3 },
                { value: 'year', label: 'Année', icon: Target }
              ].map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.value as 'month' | 'quarter' | 'year')}
                  className={selectedPeriod === period.value ? 'bg-gradient-to-r from-immoo-gold to-immoo-navy' : ''}
                >
                  <period.icon className="h-4 w-4 mr-2" />
                  {period.label}
                </Button>
              ))}
            </div>
            
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-white/80 backdrop-blur-sm"
            >
              {[2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Toggle granularity */}
            <ToggleGroup
              type="single"
              value={granularity}
              onValueChange={(v) => v && setGranularity(v as 'month' | 'year')}
              className="px-1 py-1 bg-white/80 backdrop-blur-sm border rounded-lg"
            >
              <ToggleGroupItem value="month" className="px-2 py-1 text-sm">
                Mensuel
              </ToggleGroupItem>
              <ToggleGroupItem value="year" className="px-2 py-1 text-sm">
                Annuel
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par propriété ou locataire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white/80 backdrop-blur-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Perçus</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de résumé premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total des gains
              </div>
              <div className="p-1 bg-green-100 rounded-full">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 mb-1">
              {formatCurrency(summary.totalEarnings, "FCFA")}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">{summary.transactionCount} transactions</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Actif</span>
              </div>
            </div>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center justify-between">
              <div className="flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Commissions loyers
              </div>
              <div className="p-1 bg-blue-100 rounded-full">
                <BarChart3 className="h-3 w-3 text-blue-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {formatCurrency(summary.commissionEarnings, "FCFA")}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600">Taux moyen: {summary.averageCommissionRate.toFixed(1)}%</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Récurrent
              </Badge>
            </div>
            <Progress 
              value={summary.totalEarnings > 0 ? (summary.commissionEarnings / summary.totalEarnings) * 100 : 0} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Frais d'agence
              </div>
              <div className="p-1 bg-purple-100 rounded-full">
                <Wallet className="h-3 w-3 text-purple-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {formatCurrency(summary.agencyFeeEarnings, "FCFA")}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-600">Nouveaux baux</span>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Unique
              </Badge>
            </div>
            <Progress 
              value={summary.totalEarnings > 0 ? (summary.agencyFeeEarnings / summary.totalEarnings) * 100 : 0} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Statut paiements
              </div>
              <div className="p-1 bg-orange-100 rounded-full">
                <PieChart className="h-3 w-3 text-orange-600" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">Perçus</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(summary.paidEarnings, "FCFA")}</span>
              </div>
              <Progress value={paidPercentage} className="h-2" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">En attente</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(summary.pendingEarnings, "FCFA")}</span>
              </div>
              <Progress value={pendingPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets détaillés */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm border shadow-lg">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Historique détaillé
          </TabsTrigger>
          <TabsTrigger value="by-property" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Par propriété
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-immoo-navy" />
                  Historique des gains
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpDown className="h-4 w-4" />
                  {filteredEarnings.length} résultats
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredEarnings.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">Aucun gain trouvé</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || selectedStatus !== 'all' 
                      ? 'Essayez de modifier vos filtres de recherche'
                      : 'Commencez à générer des revenus en créant des baux et en gérant des paiements'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredEarnings.map((earning, index) => (
                    <div 
                      key={earning.id} 
                      className="p-6 hover:bg-gradient-to-r hover:from-immoo-pearl/30 hover:to-immoo-gold/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl shadow-sm ${
                            earning.type === 'commission' 
                              ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700' 
                              : 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700'
                          }`}>
                            {earning.type === 'commission' ? 
                              <Percent className="h-5 w-5" /> : 
                              <Building2 className="h-5 w-5" />
                            }
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                {earning.type === 'commission' ? 'Commission sur loyer' : 'Frais d\'agence'}
                              </span>
                              <Badge 
                                variant={earning.status === 'paid' ? 'default' : 'secondary'} 
                                className={`text-xs ${
                                  earning.status === 'paid' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                }`}
                              >
                                {earning.status === 'paid' ? '✓ Perçu' : '⏳ En attente'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                {earning.propertyTitle}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {earning.tenantName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(earning.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(earning.amount, "FCFA")}
                          </div>
                          {earning.type === 'commission' && earning.rate && earning.baseAmount && (
                            <div className="text-xs text-muted-foreground">
                              {earning.rate}% de {formatCurrency(earning.baseAmount, "FCFA")}
                            </div>
                          )}
                          {earning.processedAt && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Traité le {new Date(earning.processedAt).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-property">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-immoo-navy" />
                Performance par propriété
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingByProperty ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-immoo-gold mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Analyse en cours...</p>
                </div>
              ) : !propertyEarnings || propertyEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Aucune donnée de performance disponible pour cette période</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propertyEarnings.map((property: PropertyEarning, index) => (
                    <div key={property.propertyId} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-lg">{property.propertyTitle}</h4>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(property.totalEarnings, "FCFA")}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-muted-foreground">Commissions</div>
                            <div className="font-medium">{formatCurrency(property.commissionEarnings, "FCFA")}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-muted-foreground">Frais agence</div>
                            <div className="font-medium">{formatCurrency(property.agencyFeeEarnings, "FCFA")}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-600" />
                          <div>
                            <div className="text-muted-foreground">Transactions</div>
                            <div className="font-medium">{property.transactionCount}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-muted-foreground">Taux moyen</div>
                            <div className="font-medium">{property.averageCommissionRate.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress 
                          value={propertyEarnings[0] ? (property.totalEarnings / propertyEarnings[0].totalEarnings) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-immoo-navy" />
                Analytics et tendances
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <EarningsAnalytics agencyId={agencyId!} year={selectedYear} granularity={granularity} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 