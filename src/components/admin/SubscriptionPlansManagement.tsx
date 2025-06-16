
import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import SubscriptionStatsCards from './subscription/SubscriptionStatsCards';
import SubscriptionPlanForm from './subscription/SubscriptionPlanForm';
import SubscriptionPlansTable from './subscription/SubscriptionPlansTable';
import SubscriptionLimitsTab from './subscription/SubscriptionLimitsTab';

export default function SubscriptionPlansManagement() {
  const [activeTab, setActiveTab] = useState('plans');

  const {
    plans,
    loading,
    stats,
    formData,
    setFormData,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    openCreateDialog,
    openEditDialog,
    handleCreatePlan,
    handleUpdatePlan,
    handleDeletePlan
  } = useSubscriptionManagement();

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

      <SubscriptionStatsCards stats={stats} />

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
              <SubscriptionPlansTable 
                plans={plans}
                onEditPlan={openEditDialog}
                onDeletePlan={handleDeletePlan}
              />
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
              <SubscriptionLimitsTab plans={plans} />
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
          <SubscriptionPlanForm 
            formData={formData}
            setFormData={setFormData}
          />
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
          <SubscriptionPlanForm 
            formData={formData}
            setFormData={setFormData}
            isEdit
          />
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
