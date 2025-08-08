
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getAllSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '@/services/subscriptionService';
import { SubscriptionPlan } from '@/assets/types';

interface FormData {
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  maxProperties: number;
  maxAgencies: number;
  maxLeases: number;
  maxUsers: number;
  maxTenants: number;
  hasApiAccess: boolean;
  isActive: boolean;
}

interface Stats {
  totalPlans: number;
  activePlans: number;
  totalSubscribers: number;
  monthlyRevenue: number;
}

export const useSubscriptionManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: 0,
    billingCycle: 'monthly',
    features: [''],
    maxProperties: 1,
    maxAgencies: 1,
    maxLeases: 1,
    maxUsers: 1,
    maxTenants: 3,
    hasApiAccess: false,
    isActive: true
  });

  const [stats, setStats] = useState<Stats>({
    totalPlans: 0,
    activePlans: 0,
    totalSubscribers: 0,
    monthlyRevenue: 0
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { plans: allPlans, error } = await getAllSubscriptionPlans(false);
      if (error) {
        toast.error(`Erreur lors du chargement: ${error}`);
        return;
      }
      setPlans(allPlans);
      
      // Calculate stats from actual data
      const totalPlans = allPlans.length;
      const activePlans = allPlans.filter(p => p.isActive).length;
      
      let totalRevenue = 0;
      for (const plan of allPlans) {
        totalRevenue += plan.price;
      }
      
      setStats({
        totalPlans,
        activePlans,
        totalSubscribers: 0, // This should come from actual subscription data
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
      maxTenants: 3,
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
      maxTenants: (plan as any).maxTenants || 3,
      hasApiAccess: plan.hasApiAccess || false,
      isActive: plan.isActive !== false
    });
    setIsEditDialogOpen(true);
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

  useEffect(() => {
    loadPlans();
  }, []);

  return {
    plans,
    loading,
    stats,
    formData,
    setFormData,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    selectedPlan,
    openCreateDialog,
    openEditDialog,
    handleCreatePlan,
    handleUpdatePlan,
    handleDeletePlan
  };
};
