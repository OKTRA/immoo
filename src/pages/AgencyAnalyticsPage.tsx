import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById, getAgencyStatistics } from "@/services/agency";
import { getAgencyEarnings, getMonthlyEarnings } from "@/services/agency/agencyEarningsService";
import { getExpenseSummary, getMonthlyExpenseChart, getExpensesByCategory } from "@/services/expenses/expenseService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
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
  LineChart,
  Wallet,
  CreditCard,
  Target,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Percent,
  Euro
} from "lucide-react";
import { Link } from "react-router-dom";
import { Agency } from "@/assets/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AgencyAnalyticsPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const currentYear = new Date().getFullYear();

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
    staleTime: 5 * 60 * 1000
  });

  // Earnings data
  const { data: earningsData, isLoading: isLoadingEarnings } = useQuery({
    queryKey: ['agency-earnings', agencyId, selectedPeriod],
    queryFn: () => getAgencyEarnings(agencyId || '', selectedPeriod, currentYear),
    enabled: !!agencyId
  });

  // Monthly earnings for chart
  const { data: monthlyEarningsData, isLoading: isLoadingMonthlyEarnings } = useQuery({
    queryKey: ['monthly-earnings', agencyId, currentYear],
    queryFn: () => getMonthlyEarnings(agencyId || '', currentYear),
    enabled: !!agencyId
  });

  // Expenses data
  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expense-summary', agencyId, selectedPeriod],
    queryFn: () => getExpenseSummary(agencyId || '', selectedPeriod, currentYear),
    enabled: !!agencyId
  });

  // Monthly expenses for chart
  const { data: monthlyExpensesData, isLoading: isLoadingMonthlyExpenses } = useQuery({
    queryKey: ['monthly-expenses', agencyId, currentYear],
    queryFn: () => getMonthlyExpenseChart(agencyId || '', currentYear),
    enabled: !!agencyId
  });

  // Expenses by category
  const { data: expensesByCategoryData, isLoading: isLoadingExpensesByCategory } = useQuery({
    queryKey: ['expenses-by-category', agencyId, selectedPeriod],
    queryFn: () => getExpensesByCategory(agencyId || '', selectedPeriod, currentYear),
    enabled: !!agencyId
  });

  // Payments and Collection Rate data
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['agency-payments-stats', agencyId],
    queryFn: async () => {
      if (!agencyId) return null;

      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          payment_date,
          due_date,
          leases!inner(
            id,
            properties!inner(
              id,
              agency_id
            )
          )
        `)
        .eq('leases.properties.agency_id', agencyId);

      if (error) throw error;
      
      return paymentsData || [];
    },
    enabled: !!agencyId
  });

  // Occupancy Rate data
  const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({
    queryKey: ['agency-occupancy', agencyId],
    queryFn: async () => {
      if (!agencyId) return null;

      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('id, status')
        .eq('agency_id', agencyId);

      if (error) throw error;
      
      const totalProperties = propertiesData?.length || 0;
      const occupiedProperties = propertiesData?.filter(p => p.status === 'rented' || p.status === 'occupied').length || 0;
      const availableProperties = propertiesData?.filter(p => p.status === 'available').length || 0;
      const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

      return {
        totalProperties,
        occupiedProperties,
        availableProperties,
        occupancyRate
      };
    },
    enabled: !!agencyId
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
    recentListings: [],
    totalViews: 0,
    viewsThisMonth: 0
  };

  // Calculate payments KPIs
  const payments = paymentsData || [];
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidPayments = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
  const latePayments = payments.filter(p => p.status === 'late').reduce((sum, p) => sum + (p.amount || 0), 0);
  const collectionRate = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;

  // Earnings summary
  const earnings = earningsData?.summary || {
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
    commissionEarnings: 0,
    agencyFeeEarnings: 0
  };

  // Expenses summary
  const expenses = expensesData?.data || {
    totalExpenses: 0,
    totalPaid: 0,
    totalPending: 0,
    totalApproved: 0,
    totalOverdue: 0,
    averageExpense: 0
  };

  // Occupancy data
  const occupancy = occupancyData || {
    totalProperties: 0,
    occupiedProperties: 0,
    availableProperties: 0,
    occupancyRate: 0
  };

  // Monthly data for charts
  const monthlyEarnings = monthlyEarningsData || [];
  const monthlyExpenses = monthlyExpensesData?.data || [];
  const expensesByCategory = expensesByCategoryData?.data || [];

  // Combined monthly chart data
  const combinedMonthlyData = monthlyEarnings.map((earning, index) => ({
    month: earning.month,
    revenus: earning.total,
    commissions: earning.commissions,
    fraisAgence: earning.agencyFees,
    depenses: monthlyExpenses[index]?.total || 0,
    benefice: earning.total - (monthlyExpenses[index]?.total || 0)
  }));

  if (isLoadingAgency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Agence non trouvée
          </h2>
          <p className="text-gray-600 mb-4">L'agence que vous recherchez n'existe pas.</p>
          <Button asChild>
            <Link to="/my-agencies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux agences
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {agency.verified && <Badge className="bg-green-100 text-green-700 border-green-200">Vérifié</Badge>}
                  </div>
                  <p className="text-sm text-slate-600">Tableau de bord analytique</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
                <TabsList className="bg-white">
                  <TabsTrigger value="month">Mois</TabsTrigger>
                  <TabsTrigger value="quarter">Trimestre</TabsTrigger>
                  <TabsTrigger value="year">Année</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 text-immoo-gold">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Analytics Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenus totaux */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1 font-medium">Revenus totaux</p>
                  <p className="text-3xl font-bold text-green-800">{formatCurrency(earnings.totalEarnings, "FCFA")}</p>
                  <p className="text-xs text-green-600 flex items-center mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Payés: {formatCurrency(earnings.paidEarnings, "FCFA")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Euro className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taux de recouvrement */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1 font-medium">Taux de recouvrement</p>
                  <p className="text-3xl font-bold text-blue-800">{Number(collectionRate ?? 0).toFixed(1)}%</p>
                  <p className="text-xs text-blue-600 flex items-center mt-2">
                    <Target className="w-3 h-3 mr-1" />
                    {formatCurrency(paidPayments, "FCFA")} collectés
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taux d'occupation */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1 font-medium">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-purple-800">{Number(occupancy.occupancyRate ?? 0).toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 flex items-center mt-2">
                    <Home className="w-3 h-3 mr-1" />
                    {occupancy.occupiedProperties}/{occupancy.totalProperties} propriétés
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dépenses totales */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 mb-1 font-medium">Dépenses totales</p>
                  <p className="text-3xl font-bold text-orange-800">{formatCurrency(expenses.totalExpenses, "FCFA")}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-2">
                    <Receipt className="w-3 h-3 mr-1" />
                    Payées: {formatCurrency(expenses.totalPaid, "FCFA")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques en deux colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution mensuelle des revenus vs dépenses */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                Évolution des revenus et dépenses
              </CardTitle>
              <CardDescription>Comparaison mensuelle sur {currentYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(Number(value), "FCFA"), name]}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend />
                    <Bar dataKey="revenus" fill="#10b981" name="Revenus" />
                    <Bar dataKey="depenses" fill="#f59e0b" name="Dépenses" />
                    <Bar dataKey="benefice" fill="#3b82f6" name="Bénéfice" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition des dépenses par catégorie */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <PieChart className="w-5 h-5 mr-2 text-green-500" />
                Répartition des dépenses
              </CardTitle>
              <CardDescription>Par catégorie pour la période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total_amount"
                        label={({ category, percentage }) => `${category}: ${Number(percentage ?? 0).toFixed(1)}%`}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value), "FCFA")} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune dépense pour cette période</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section des KPIs détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détail des paiements */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                État des paiements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Payés</span>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(paidPayments, "FCFA")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">En attente</span>
                </div>
                <span className="font-semibold text-orange-600">{formatCurrency(pendingPayments, "FCFA")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">En retard</span>
                </div>
                <span className="font-semibold text-red-600">{formatCurrency(latePayments, "FCFA")}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalPayments, "FCFA")}</span>
              </div>
              <Progress value={collectionRate} className="h-3" />
              <p className="text-xs text-center text-gray-600">{Number(collectionRate ?? 0).toFixed(1)}% de taux de recouvrement</p>
            </CardContent>
          </Card>

          {/* Détail des revenus */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Wallet className="w-5 h-5 mr-2 text-green-500" />
                Sources de revenus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Commissions</span>
                </div>
                <span className="font-semibold text-blue-600">{formatCurrency(earnings.commissionEarnings, "FCFA")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Frais d'agence</span>
                </div>
                <span className="font-semibold text-purple-600">{formatCurrency(earnings.agencyFeeEarnings, "FCFA")}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Encaissés</span>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(earnings.paidEarnings, "FCFA")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">En attente</span>
                </div>
                <span className="font-semibold text-orange-600">{formatCurrency(earnings.pendingEarnings, "FCFA")}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(earnings.totalEarnings, "FCFA")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques générales */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Performance générale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Propriétés</span>
                </div>
                <span className="font-semibold">{stats.propertiesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Note moyenne</span>
                </div>
                <span className="font-semibold">{Number(stats.avgRating ?? 0).toFixed(1)}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Vues ce mois</span>
                </div>
                <span className="font-semibold">{stats.viewsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Vues totales</span>
                </div>
                <span className="font-semibold">{stats.totalViews}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Performance</span>
                </div>
                <span className="font-semibold text-green-600">{stats.performance || 0}%</span>
              </div>
              <Progress value={stats.performance || 0} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to={`/agencies/${agencyId}/properties`}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100">
              <CardContent className="p-6 text-center">
                <Home className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1 text-blue-900">Gérer les propriétés</h3>
                <p className="text-sm text-blue-700">Ajouter, modifier et gérer vos biens</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={`/agencies/${agencyId}/earnings`}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1 text-green-900">Voir les revenus</h3>
                <p className="text-sm text-green-700">Détail des commissions et frais</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={`/agencies/${agencyId}/payments`}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100">
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1 text-purple-900">Gérer les paiements</h3>
                <p className="text-sm text-purple-700">Suivi des encaissements</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={`/agencies/${agencyId}/expenses`}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100">
              <CardContent className="p-6 text-center">
                <Receipt className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1 text-orange-900">Gérer les dépenses</h3>
                <p className="text-sm text-orange-700">Suivi et contrôle des coûts</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
