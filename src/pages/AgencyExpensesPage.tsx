import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpensesManagement } from '@/hooks/useExpensesManagement';
import { ExpenseFilters } from '@/types/expenses';
import { getPropertiesByAgencyId } from '@/services/property/propertyQueries';
import { Plus, Filter, Download, Receipt, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import ExpenseFormDialog from '@/components/expenses/ExpenseFormDialog';
import { getExpenseCategories } from '@/services/expenses/expenseService';
import { createExpense } from '@/services/expenses/expenseService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

export default function AgencyExpensesPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [open, setOpen] = useState(false);
  const [formProperties, setFormProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Hook de gestion des dépenses
  const {
    expenses,
    summary,
    isLoading: expensesLoading,
    error,
    createExpense: bulkCreateExpense,
    updateExpense,
    deleteExpense,
    bulkAction
  } = useExpensesManagement(agencyId!);

  // Récupérer les propriétés pour les filtres
  const { data: propertiesData } = useQuery({
    queryKey: ['agency-properties', agencyId],
    queryFn: () => getPropertiesByAgencyId(agencyId!),
    enabled: !!agencyId,
    refetchOnWindowFocus: false
  });

  const properties = Array.isArray(propertiesData) ? propertiesData : [];

  useEffect(() => {
    async function fetchData() {
      const props = await getPropertiesByAgencyId(agencyId);
      setFormProperties(props || []);
      const { data: cats } = await getExpenseCategories();
      setCategories(cats || []);
    }
    if (open) fetchData();
  }, [open, agencyId]);

  useEffect(() => {
    if (summary) {
      console.log('Résumé récupéré:', summary);
    }
  }, [summary]);

  const handleCreateExpense = async (data) => {
    // Nettoyer les champs date vides et vérifier la priorité
    const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
    const cleanedData = {
      ...data,
      date: data.date || null,
      next_due_date: data.next_due_date || null,
      priority: allowedPriorities.includes(data.priority) ? data.priority : 'medium',
      status: 'approved', // statut par défaut
    };
    console.log('priority envoyée:', cleanedData.priority);
    setIsLoading(true);
    const { data: created, error } = await createExpense(cleanedData);
    setIsLoading(false);
    if (error) {
      console.error('Erreur détaillée création dépense:', error);
      toast.error('Erreur lors de la création de la dépense');
    } else {
      toast.success('Dépense créée avec succès');
      setOpen(false);
      // Optionnel : rafraîchir la liste des dépenses ici
    }
  };

  // Gestionnaires d'événements
  const handleFilterChange = (newFilters: Partial<ExpenseFilters>) => {
    // Si la valeur est 'all', on la remplace par undefined (pas de filtre)
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).map(([k, v]) => [k, v === 'all' ? undefined : v])
    );
    setFilters(prev => ({ ...prev, ...cleanedFilters }));
  };

  const handleBulkAction = async (action: string, expenseIds: string[]) => {
    await bulkAction({ expense_ids: expenseIds, action: action as any, notes: '' });
  };

  // 1. Mapper le vrai nom de propriété sur chaque dépense
  const expensesWithPropertyTitle = React.useMemo(() => {
    if (!expenses || !properties) return expenses || [];
    const propertyMap = Object.fromEntries(properties.map(p => [p.id, p.title]));
    return expenses.map(exp => ({
      ...exp,
      property_title: exp.property_title || propertyMap[exp.property_id] || 'Propriété'
    }));
  }, [expenses, properties]);

  // Calculer les données pour les graphiques
  const monthlyData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [
        { month: 'Jan', total: 0 },
        { month: 'Fév', total: 0 },
        { month: 'Mar', total: 0 },
        { month: 'Avr', total: 0 },
        { month: 'Mai', total: 0 },
        { month: 'Juin', total: 0 }
      ];
    }

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const currentDate = new Date();
    const monthlyTotals = new Array(6).fill(0);

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthDiff = currentDate.getMonth() - expenseDate.getMonth() + (currentDate.getFullYear() - expenseDate.getFullYear()) * 12;
      
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyTotals[5 - monthDiff] += expense.amount;
      }
    });

    return months.map((month, index) => ({
      month,
      total: monthlyTotals[index]
    }));
  }, [expenses]);

  const categoryData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [
        { name: 'Maintenance', value: 0, color: '#3B82F6' },
        { name: 'Services', value: 0, color: '#10B981' },
        { name: 'Assurance', value: 0, color: '#F59E0B' },
        { name: 'Taxes', value: 0, color: '#EF4444' }
      ];
    }

    const categoryTotals = {};
    expenses.forEach(expense => {
      const category = expense.category_name || expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [expenses]);

  // Données pour analyses avancées
  const topPropertiesData = React.useMemo(() => {
    if (!expensesWithPropertyTitle || expensesWithPropertyTitle.length === 0) return [];
    const propertyTotals = {};
    expensesWithPropertyTitle.forEach(exp => {
      const title = exp.property_title || 'Propriété';
      propertyTotals[title] = (propertyTotals[title] || 0) + exp.amount;
    });
    return Object.entries(propertyTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expensesWithPropertyTitle]);

  const cumulativeData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    let sum = 0;
    return sorted.map(exp => {
      sum += exp.amount;
      return {
        date: new Date(exp.date).toLocaleDateString('fr-FR'),
        cumul: sum
      };
    });
  }, [expenses]);

  const statusData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    const statusTotals = {};
    expenses.forEach(exp => {
      statusTotals[exp.status] = (statusTotals[exp.status] || 0) + exp.amount;
    });
    const colors = {
      paid: '#10B981',
      approved: '#3B82F6',
      rejected: '#EF4444',
      pending: '#F59E0B'
    };
    return Object.entries(statusTotals).map(([name, value]) => ({ name, value, color: colors[name] || '#A1A1AA' }));
  }, [expenses]);

  if (expensesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des dépenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Erreur lors du chargement des dépenses</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Dépenses</h1>
          <p className="text-muted-foreground">
            Suivez et gérez les dépenses de vos propriétés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setOpen(true)} className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Dépense
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cartes de résumé */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.total_expenses ? `${summary.total_expenses.toLocaleString()} FCFA` : '0 FCFA'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Récurrentes</CardTitle>
                <Receipt className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.recurring_expenses_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dépenses récurrentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques simplifiés */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Évolution Mensuelle</CardTitle>
                <CardDescription>
                  Tendances des dépenses sur les 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} FCFA`, 'Total']} />
                    <Bar dataKey="total" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>
                  Répartition des dépenses par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} FCFA`, 'Montant']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* Dans la Vue d'ensemble, après les graphiques */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Détail par propriété et catégorie</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 border">Propriété</th>
                    <th className="px-4 py-2 border">Total</th>
                    <th className="px-4 py-2 border">Nb Dépenses</th>
                    <th className="px-4 py-2 border">Détail par Catégorie</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => {
                    const propertyExpenses = expensesWithPropertyTitle.filter(e => e.property_id === property.id);
                    if (propertyExpenses.length === 0) return null;
                    const total = propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const categoryMap = {};
                    propertyExpenses.forEach(e => {
                      const cat = e.category_name || e.category;
                      categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
                    });
                    return (
                      <tr key={property.id} className="border-b">
                        <td className="px-4 py-2 border font-medium">{property.title}</td>
                        <td className="px-4 py-2 border">{total.toLocaleString()} FCFA</td>
                        <td className="px-4 py-2 border">{propertyExpenses.length}</td>
                        <td className="px-4 py-2 border">
                          {Object.entries(categoryMap).map(([cat, val]) => (
                            <span key={cat} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-50 rounded text-xs">
                              {cat}: {val.toLocaleString()} FCFA
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Liste des dépenses */}
        <TabsContent value="list" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Propriété</label>
                  <Select value={filters.property_id || 'all'} onValueChange={(value) => handleFilterChange({ property_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les propriétés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les propriétés</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange({ status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange({ category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utilities">Services publics</SelectItem>
                      <SelectItem value="insurance">Assurance</SelectItem>
                      <SelectItem value="taxes">Taxes</SelectItem>
                      <SelectItem value="other">Autres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste groupée par propriété */}
          <Card>
            <CardHeader>
              <CardTitle>Dépenses par Propriété</CardTitle>
              <CardDescription>
                {expenses?.length || 0} dépense(s) trouvée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {console.log('Dépenses récupérées pour affichage:', expenses)}
              {properties.map((property) => {
                const propertyExpenses = expenses
                  .filter((expense) => expense.property_id === property.id); // temporairement sans filtre de statut

                if (propertyExpenses.length === 0) return null;

                // Calcul du total
                const total = propertyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

                return (
                  <div key={property.id} className="mb-8">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <div className="mb-2 text-right font-bold text-blue-700">
                      Total : {total.toLocaleString()} FCFA
                    </div>
                    <div className="space-y-4">
                      {propertyExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Receipt className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{expense.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                {expense.category_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(expense.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium">
                                {expense.amount.toLocaleString()} FCFA
                              </div>
                              <Badge variant={
                                expense.status === 'paid' ? 'default' : 'secondary'
                              }>
                                {expense.status === 'paid' ? 'Payé' : 'Approuvé'}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowDetail(true);
                              }}
                            >
                              Voir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {/* Si aucune dépense */}
              {properties.every(property => expenses.filter(
                (expense) => expense.property_id === property.id && ['approved', 'paid'].includes(expense.status)
              ).length === 0) && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune dépense acceptée</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par ajouter votre première dépense
                  </p>
                  <Button onClick={() => setOpen(true)} className="h-10">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Dépense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyses */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses Avancées</CardTitle>
              <CardDescription>
                Graphiques et analyses détaillées des dépenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Propriétés par Dépenses</CardTitle>
                    <CardDescription>
                      Les propriétés ayant généré le plus de dépenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topPropertiesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip formatter={(value) => [`${value} FCFA`, 'Total']} />
                        <Bar dataKey="value" fill="#6366F1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution Cumulée des Dépenses</CardTitle>
                    <CardDescription>
                      Somme cumulée des dépenses au fil du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} FCFA`, 'Cumul']} />
                        <Legend />
                        <Line type="monotone" dataKey="cumul" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des Statuts de Dépenses</CardTitle>
                    <CardDescription>
                      Part de chaque statut dans le total des dépenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-status-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} FCFA`, 'Montant']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Détail par propriété et catégorie</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 border">Propriété</th>
                        <th className="px-4 py-2 border">Total</th>
                        <th className="px-4 py-2 border">Nb Dépenses</th>
                        <th className="px-4 py-2 border">Détail par Catégorie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map(property => {
                        const propertyExpenses = expensesWithPropertyTitle.filter(e => e.property_id === property.id);
                        if (propertyExpenses.length === 0) return null;
                        const total = propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
                        const categoryMap = {};
                        propertyExpenses.forEach(e => {
                          const cat = e.category_name || e.category;
                          categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
                        });
                        return (
                          <tr key={property.id} className="border-b">
                            <td className="px-4 py-2 border font-medium">{property.title}</td>
                            <td className="px-4 py-2 border">{total.toLocaleString()} FCFA</td>
                            <td className="px-4 py-2 border">{propertyExpenses.length}</td>
                            <td className="px-4 py-2 border">
                              {Object.entries(categoryMap).map(([cat, val]) => (
                                <span key={cat} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-50 rounded text-xs">
                                  {cat}: {val.toLocaleString()} FCFA
                                </span>
                              ))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapports */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
              <CardDescription>
                Générez et téléchargez des rapports détaillés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Rapport Mensuel
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Rapport Trimestriel
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Rapport Annuel
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Rapport par Propriété
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de création (simplifié) */}
      <ExpenseFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleCreateExpense}
        properties={formProperties}
        categories={categories}
        isLoading={isLoading}
      />

      {showDetail && selectedExpense && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {/* Image/photo en haut */}
            {selectedExpense.receipt_url ? (
              <img
                src={selectedExpense.receipt_url}
                alt="Pièce jointe"
                className="w-full h-48 object-cover border-b"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 border-b">
                <span className="text-5xl text-gray-300">📄</span>
              </div>
            )}
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl mb-2">{selectedExpense.description || 'Dépense'}</DialogTitle>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-blue-700">{selectedExpense.amount.toLocaleString()} FCFA</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedExpense.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedExpense.status === 'paid' ? 'Payé' : 'Approuvé'}</span>
                </div>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div><b>Catégorie :</b> {selectedExpense.category_name}</div>
                <div><b>Date :</b> {new Date(selectedExpense.date).toLocaleDateString('fr-FR')}</div>
                <div><b>Propriété :</b> {selectedExpense.property_title}</div>
                {selectedExpense.notes && <div><b>Notes :</b> {selectedExpense.notes}</div>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 