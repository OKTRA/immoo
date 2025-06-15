import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  PlusCircle, Trash2, Edit, Users, CreditCard, Settings, 
  BarChart3, Package, CheckCircle, XCircle, Star, Crown, Building
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAllSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '@/services/subscriptionService';
import { SubscriptionPlan } from '@/assets/types';

export default function SubscriptionPlansManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    billingCycle: 'monthly',
    features: [''],
    maxProperties: 1,
    maxAgencies: 1,
    maxLeases: 1,
    maxUsers: 1,
    hasApiAccess: false,
    isActive: true
  });

  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalSubscribers: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { plans: allPlans, error } = await getAllSubscriptionPlans(false);
      if (error) {
        toast.error(`Erreur lors du chargement: ${error}`);
        return;
      }
      setPlans(allPlans);
      
      // Calculate stats
      const totalPlans = allPlans.length;
      const activePlans = allPlans.filter(p => p.isActive).length;
      const totalRevenue = allPlans.reduce((sum, plan) => sum + (plan.price * 10), 0);
      
      setStats({
        totalPlans,
        activePlans,
        totalSubscribers: Math.floor(Math.random() * 150) + 50,
        monthlyRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      billingCycle: 'monthly',
      features: [''],
      maxProperties: 1,
      maxAgencies: 1,
      maxLeases: 1,
      maxUsers: 1,
      hasApiAccess: false,
      isActive: true
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle || 'monthly',
      features: plan.features,
      maxProperties: plan.maxProperties || 1,
      maxAgencies: plan.maxAgencies || 1,
      maxLeases: plan.maxLeases || 1,
      maxUsers: plan.maxUsers || 1,
      hasApiAccess: plan.hasApiAccess || false,
      isActive: plan.isActive !== false
    });
    setIsEditDialogOpen(true);
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };

  const removeFeature = (index: number) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures.splice(index, 1);
      return {
        ...prev,
        features: updatedFeatures.length > 0 ? updatedFeatures : ['']
      };
    });
  };

  const handleCreatePlan = async () => {
    try {
      if (!formData.name || formData.price <= 0) {
        toast.error("Le nom et le prix sont requis");
        return;
      }

      const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
      if (filteredFeatures.length === 0) {
        toast.error("Ajoutez au moins une fonctionnalité");
        return;
      }

      const { plan, error } = await createSubscriptionPlan({
        ...formData,
        features: filteredFeatures
      });

      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }

      toast.success("Plan créé avec succès");
      setIsCreateDialogOpen(false);
      loadPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error("Erreur lors de la création du plan");
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;

    try {
      const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
      
      const { plan, error } = await updateSubscriptionPlan(selectedPlan.id, {
        ...formData,
        features: filteredFeatures
      });

      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }

      toast.success("Plan mis à jour avec succès");
      setIsEditDialogOpen(false);
      loadPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error("Erreur lors de la mise à jour du plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { success, error } = await deleteSubscriptionPlan(planId);
      
      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }

      toast.success("Plan supprimé avec succès");
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error("Erreur lors de la suppression du plan");
    }
  };

  const PlanForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="plan-name">Nom du plan</Label>
          <Input 
            id="plan-name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Premium" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plan-price">Prix (FCFA)</Label>
          <Input 
            id="plan-price" 
            type="number" 
            value={formData.price || ''}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            min="0" 
            step="1000" 
            placeholder="15000" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="billing-cycle">Cycle de facturation</Label>
          <select 
            id="billing-cycle"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.billingCycle}
            onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
          >
            <option value="monthly">Mensuel</option>
            <option value="yearly">Annuel</option>
            <option value="quarterly">Trimestriel</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-properties">Propriétés max</Label>
          <Input 
            id="max-properties" 
            type="number" 
            value={formData.maxProperties || ''}
            onChange={(e) => setFormData({...formData, maxProperties: parseInt(e.target.value) || 1})}
            min="1" 
            placeholder="10" 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="max-agencies">Agences max</Label>
          <Input 
            id="max-agencies" 
            type="number" 
            value={formData.maxAgencies || ''}
            onChange={(e) => setFormData({...formData, maxAgencies: parseInt(e.target.value) || 1})}
            min="1" 
            placeholder="5" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-leases">Baux max</Label>
          <Input 
            id="max-leases" 
            type="number" 
            value={formData.maxLeases || ''}
            onChange={(e) => setFormData({...formData, maxLeases: parseInt(e.target.value) || 1})}
            min="1" 
            placeholder="20" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-users">Utilisateurs max</Label>
          <Input 
            id="max-users" 
            type="number" 
            value={formData.maxUsers || ''}
            onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value) || 1})}
            min="1" 
            placeholder="5" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={formData.hasApiAccess}
          onCheckedChange={(checked) => setFormData({...formData, hasApiAccess: checked})}
        />
        <Label htmlFor="api-access">Accès API</Label>
      </div>

      <div className="grid gap-2">
        <Label>Fonctionnalités</Label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input 
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              placeholder="Fonctionnalité..." 
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeFeature(index)}
              disabled={formData.features.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button 
          variant="outline" 
          onClick={handleAddFeature}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une fonctionnalité
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label>Plan actif</Label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des abonnements</h1>
          <p className="text-muted-foreground">
            Gérez les plans d'abonnement et suivez les statistiques
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePlans} actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              +12% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              +8% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              +3% ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans d'abonnement</TabsTrigger>
          <TabsTrigger value="limits">Gestion des limites</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plans d'abonnement</CardTitle>
              <CardDescription>
                Gérez tous vos plans d'abonnement avec leurs limites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Prix (FCFA)</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Propriétés</TableHead>
                    <TableHead>Agences</TableHead>
                    <TableHead>Baux</TableHead>
                    <TableHead>Utilisateurs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{plan.name}</span>
                          {plan.popular && (
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1" />
                              Populaire
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.price.toLocaleString()} FCFA
                        <span className="text-sm text-muted-foreground">
                          /{plan.billingCycle === 'monthly' ? 'mois' : 
                            plan.billingCycle === 'yearly' ? 'an' : 'trim'}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">
                        {plan.billingCycle === 'monthly' ? 'Mensuel' : 
                         plan.billingCycle === 'yearly' ? 'Annuel' : 'Trimestriel'}
                      </TableCell>
                      <TableCell>{plan.maxProperties}</TableCell>
                      <TableCell>{plan.maxAgencies}</TableCell>
                      <TableCell>{plan.maxLeases}</TableCell>
                      <TableCell>{plan.maxUsers}</TableCell>
                      <TableCell>
                        {plan.isActive ? (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer le plan "{plan.name}" ? 
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePlan(plan.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des limites par plan</CardTitle>
              <CardDescription>
                Configurez les limites de ressources pour chaque plan d'abonnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {plans.filter(p => p.isActive).map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <Badge variant={plan.popular ? "default" : "secondary"}>
                        {plan.price.toLocaleString()} FCFA/{plan.billingCycle === 'monthly' ? 'mois' : 'an'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded">
                        <Building className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <div className="font-semibold">{plan.maxProperties}</div>
                        <div className="text-sm text-muted-foreground">Propriétés</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded">
                        <Crown className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                        <div className="font-semibold">{plan.maxAgencies}</div>
                        <div className="text-sm text-muted-foreground">Agences</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded">
                        <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <div className="font-semibold">{plan.maxLeases}</div>
                        <div className="text-sm text-muted-foreground">Baux</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded">
                        <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <div className="font-semibold">{plan.maxUsers}</div>
                        <div className="text-sm text-muted-foreground">Utilisateurs</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analyses d'abonnement</CardTitle>
              <CardDescription>
                Statistiques détaillées sur les abonnements et conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Les analyses détaillées seront implémentées prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau plan</DialogTitle>
          </DialogHeader>
          <PlanForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePlan}>
              Créer le plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le plan</DialogTitle>
          </DialogHeader>
          <PlanForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePlan}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
