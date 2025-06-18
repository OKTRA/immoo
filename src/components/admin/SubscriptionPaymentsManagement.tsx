import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Settings,
  DollarSign,
  Users,
  Building,
  Loader2,
  UserPlus,
  Crown,
  Eye,
  Ban,
  Trash2,
  MoreHorizontal,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ManualSubscriptionService } from '@/services/subscription/manualSubscriptionService';

interface SubscriptionPayment {
  id: string;
  userId: string;
  agencyId: string;
  planId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
  agencyName: string;
  planName: string;
  userEmail: string;
}

interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  paidPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface UserAgency {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  agency_id?: string;
  agency_name?: string;
  current_plan?: string;
  current_plan_id?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  max_properties: number;
  max_agencies: number;
  max_leases: number;
  max_users: number;
  features: string[];
  subscription?: {
    id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  requires_verification: boolean;
  processing_fee_percentage: number;
  processing_fee_fixed: number;
}

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount: number;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  applicable_plans?: string[];
}

interface PromoCodeValidation {
  valid: boolean;
  error?: string;
  promo_code_id?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  promo_name?: string;
  description?: string;
}

export default function SubscriptionPaymentsManagement() {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    pendingPayments: 0,
    paidPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<SubscriptionPayment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActivationDialogOpen, setIsActivationDialogOpen] = useState(false);
  const [autoActivation, setAutoActivation] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Nouveaux états pour l'activation/upgrade manuel
  const [isManualActivationDialogOpen, setIsManualActivationDialogOpen] = useState(false);
  const [userAgencies, setUserAgencies] = useState<UserAgency[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualActivationHistory, setManualActivationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('payments');
  
  // Nouveaux états pour les actions supplémentaires
  const [isPlanDetailDialogOpen, setIsPlanDetailDialogOpen] = useState(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<SubscriptionPlan | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadPayments();
    loadSettings();
    loadUserAgencies();
    loadSubscriptionPlans();
    loadPaymentMethods();
    loadPromoCodes();
    loadManualActivationHistory();
  }, []);

  const loadUserAgencies = async () => {
    try {
      // Version simplifiée qui fonctionne
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          agency_id,
          role
        `)
        .not('agency_id', 'is', null)
        .eq('role', 'agency');

      if (error) throw error;

      if (!users || users.length === 0) {
        setUserAgencies([]);
        return;
      }

      // Récupérer les agences séparément
      const agencyIds = [...new Set(users.map(u => u.agency_id).filter(Boolean))];
      const { data: agencies } = await supabase
        .from('agencies')
        .select('id, name')
        .in('id', agencyIds);

      // Récupérer les abonnements actifs séparément
      const userIds = users.map(u => u.id);
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select(`
          user_id,
          plan_id,
          status
        `)
        .in('user_id', userIds)
        .eq('status', 'active');

      // Récupérer les plans
      const planIds = [...new Set((subscriptions || []).map(s => s.plan_id).filter(Boolean))];
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .in('id', planIds);

      // Créer les maps
      const agenciesMap = new Map((agencies || []).map(a => [a.id, a.name]));
      const subscriptionsMap = new Map((subscriptions || []).map(s => [s.user_id, s]));
      const plansMap = new Map((plans || []).map(p => [p.id, p.name]));

      const formattedUsers = users.map(user => {
        const subscription = subscriptionsMap.get(user.id);
        const planName = subscription ? plansMap.get(subscription.plan_id) : null;

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          agency_id: user.agency_id,
          agency_name: agenciesMap.get(user.agency_id) || 'N/A',
          current_plan: planName || 'Aucun',
          current_plan_id: subscription?.plan_id || null
        };
      });

      setUserAgencies(formattedUsers);
    } catch (error) {
      console.error('Error loading user agencies:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setSubscriptionPlans(plans || []);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      toast.error('Erreur lors du chargement des plans');
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await ManualSubscriptionService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Erreur lors du chargement des méthodes de paiement');
    }
  };

  const loadPromoCodes = async () => {
    try {
      const codes = await ManualSubscriptionService.getPromoCodes();
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Erreur lors du chargement des codes promo');
    }
  };

  const loadManualActivationHistory = async () => {
    try {
      const { data: history, error } = await supabase
        .from('billing_history')
        .select(`
          *,
          profiles(email, first_name, last_name),
          agencies(name),
          subscription_plans(name, price)
        `)
        .eq('payment_method', 'manual_activation')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setManualActivationHistory(history || []);
    } catch (error) {
      console.error('Error loading manual activation history:', error);
      // Ne pas afficher d'erreur car c'est optionnel
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode || !selectedUser || !selectedPlan) return;

    try {
      const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!selectedPlanData) return;

      const validation = await ManualSubscriptionService.validatePromoCode(
        promoCode,
        selectedUser,
        selectedPlan,
        selectedPlanData.price
      );

      setPromoValidation(validation);

      if (!validation.valid) {
        toast.error(validation.error || 'Code promo invalide');
      } else {
        toast.success(`Code promo valide ! Réduction de ${validation.discount_amount} FCFA`);
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      toast.error('Erreur lors de la validation du code promo');
      setPromoValidation(null);
    }
  };

  const handleManualSubscriptionActivation = async () => {
    if (!selectedUser || !selectedPlan || !selectedPaymentMethod) {
      toast.error('Veuillez sélectionner un utilisateur, un plan et une méthode de paiement');
      return;
    }

    // PROTECTION CONTRE LES DOUBLONS - Vérifier s'il y a déjà une activation récente du même plan
    const selectedUserData = userAgencies.find(u => u.id === selectedUser);
    const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
    
    // Vérifier si l'utilisateur a déjà ce plan actif
    if (selectedUserData?.current_plan_id === selectedPlan) {
      toast.error(`${selectedUserData.first_name} ${selectedUserData.last_name} a déjà le plan ${selectedPlanData?.name} actif. Aucune action nécessaire.`);
      return;
    }

    // Vérifier s'il y a eu une activation récente (dans les 5 dernières minutes) pour éviter les doublons
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    try {
      const { data: recentActivations, error: checkError } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', selectedUser)
        .eq('plan_id', selectedPlan)
        .eq('payment_method', 'manual_activation')
        .gte('created_at', fiveMinutesAgo);

      if (checkError) throw checkError;

      if (recentActivations && recentActivations.length > 0) {
        toast.error(`Une activation récente du plan ${selectedPlanData?.name} a déjà été effectuée pour cet utilisateur. Veuillez attendre quelques minutes avant de réessayer.`);
        return;
      }
    } catch (error) {
      console.error('Error checking recent activations:', error);
      // Continue avec l'activation si la vérification échoue
    }

    setIsProcessing(true);
    try {
      const result = await ManualSubscriptionService.activateSubscription({
        userId: selectedUser,
        planId: selectedPlan,
        paymentMethodId: selectedPaymentMethod,
        promoCode: promoCode || undefined,
        adminNote: adminNote || `Activation manuelle du plan ${selectedPlanData?.name} pour ${selectedUserData?.first_name} ${selectedUserData?.last_name}`
      });
      
      // Message de succès avec plus de détails
      const successMessage = `Abonnement ${selectedPlanData?.name} activé avec succès pour ${selectedUserData?.first_name} ${selectedUserData?.last_name}`;
      
      toast.success(successMessage);
      
      // Recharger les données
      loadPayments();
      loadUserAgencies();
      loadManualActivationHistory();
      
      // Fermer le dialog et réinitialiser
      setIsManualActivationDialogOpen(false);
      resetActivationForm();

    } catch (error: any) {
      console.error('Error activating subscription:', error);
      toast.error(error.message || 'Erreur lors de l\'activation de l\'abonnement');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetActivationForm = () => {
    setSelectedUser('');
    setSelectedPlan('');
    setSelectedPaymentMethod('');
    setPromoCode('');
    setPromoValidation(null);
    setAdminNote('');
    setUserSearchTerm('');
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Charger d'abord les données de billing_history sans jointures
      const { data: billingData, error } = await supabase
        .from('billing_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        toast.error('Erreur lors du chargement des paiements');
        setPayments([]);
        setStats({
          totalPayments: 0,
          pendingPayments: 0,
          paidPayments: 0,
          totalRevenue: 0,
          monthlyRevenue: 0
        });
        return;
      }

      if (!billingData || billingData.length === 0) {
        setPayments([]);
        setStats({
          totalPayments: 0,
          pendingPayments: 0,
          paidPayments: 0,
          totalRevenue: 0,
          monthlyRevenue: 0
        });
        return;
      }

      // Récupérer les données liées séparément
      const userIds = [...new Set(billingData.map(p => p.user_id).filter(Boolean))];
      const planIds = [...new Set(billingData.map(p => p.plan_id).filter(Boolean))];
      const agencyIds = [...new Set(billingData.map(p => p.agency_id).filter(Boolean))];

      // Requêtes parallèles pour les données liées
      const [usersResult, plansResult, agenciesResult] = await Promise.all([
        userIds.length > 0 ? supabase.from('profiles').select('id, email').in('id', userIds) : { data: [] },
        planIds.length > 0 ? supabase.from('subscription_plans').select('id, name').in('id', planIds) : { data: [] },
        agencyIds.length > 0 ? supabase.from('agencies').select('id, name').in('id', agencyIds) : { data: [] }
      ]);

      // Créer des maps pour les lookups rapides
      const usersMap = new Map((usersResult.data || []).map(u => [u.id, u]));
      const plansMap = new Map((plansResult.data || []).map(p => [p.id, p]));
      const agenciesMap = new Map((agenciesResult.data || []).map(a => [a.id, a]));

      // Combiner les données
      const paymentsWithDetails = billingData.map(payment => ({
        id: payment.id,
        userId: payment.user_id,
        agencyId: payment.agency_id,
        planId: payment.plan_id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.payment_method || 'N/A',
        transactionId: payment.transaction_id,
        createdAt: payment.created_at,
        paidAt: payment.payment_date,
        agencyName: agenciesMap.get(payment.agency_id)?.name || 'N/A',
        planName: plansMap.get(payment.plan_id)?.name || 'N/A',
        userEmail: usersMap.get(payment.user_id)?.email || 'N/A'
      }));

      setPayments(paymentsWithDetails);

      // Calculer les statistiques
      const totalPayments = paymentsWithDetails.length;
      const pendingPayments = paymentsWithDetails.filter(p => p.status === 'pending').length;
      const paidPayments = paymentsWithDetails.filter(p => p.status === 'paid').length;
      const totalRevenue = paymentsWithDetails
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyRevenue = paymentsWithDetails
        .filter(p => p.status === 'paid' && new Date(p.paidAt || p.createdAt) >= thisMonth)
        .reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalPayments,
        pendingPayments,
        paidPayments,
        totalRevenue,
        monthlyRevenue
      });

    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'auto_subscription_activation')
        .maybeSingle();
      
      if (data) {
        setAutoActivation(data.config_value?.enabled || true);
      }
    } catch (error) {
      console.log('No auto activation config found, using default');
    }
  };

  const handleManualActivation = async (paymentId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      // Marquer le paiement comme payé
      const { error: billingError } = await supabase
        .from('billing_history')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (billingError) throw billingError;

      // Activer l'abonnement
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: payment.userId,
          agency_id: payment.agencyId,
          plan_id: payment.planId,
          status: 'active',
          start_date: new Date().toISOString()
        });

      if (subscriptionError) throw subscriptionError;

      toast.success('Abonnement activé manuellement');
      loadPayments();
      setIsActivationDialogOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Erreur lors de l\'activation');
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('billing_history')
        .update({ 
          status: newStatus,
          payment_date: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Statut mis à jour');
      loadPayments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAutoActivationToggle = async (enabled: boolean) => {
    try {
      // Essayer de mettre à jour d'abord
      const { data: existingConfig } = await supabase
        .from('system_config')
        .select('id')
        .eq('config_key', 'auto_subscription_activation')
        .maybeSingle();

      if (existingConfig) {
        // Mettre à jour l'existant
        const { error } = await supabase
          .from('system_config')
          .update({
            config_value: { enabled },
            updated_at: new Date().toISOString()
          })
          .eq('config_key', 'auto_subscription_activation');

        if (error) throw error;
      } else {
        // Créer une nouvelle entrée
        const { error } = await supabase
          .from('system_config')
          .insert({
            config_key: 'auto_subscription_activation',
            config_value: { enabled },
            category: 'payments',
            description: 'Activation automatique des abonnements après paiement'
          });

        if (error) throw error;
      }

      setAutoActivation(enabled);
      toast.success(`Activation automatique ${enabled ? 'activée' : 'désactivée'}`);
    } catch (error) {
      console.error('Error updating auto activation:', error);
      // Fallback: simplement mettre à jour l'état local
      setAutoActivation(enabled);
      toast.warning(`Configuration mise à jour localement (${enabled ? 'activée' : 'désactivée'})`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Payé</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Nouvelles fonctions pour les actions supplémentaires
  const handleViewPlanDetails = async (payment: SubscriptionPayment) => {
    try {
      // Récupérer les détails du plan ET de l'abonnement
      const [planResult, subscriptionResult] = await Promise.all([
        supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', payment.planId)
          .single(),
        supabase
          .from('user_subscriptions')
          .select('id, status, start_date, end_date, created_at, updated_at')
          .eq('user_id', payment.userId)
          .eq('plan_id', payment.planId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (planResult.error) throw planResult.error;

      // Ajouter les informations de l'abonnement au plan
      const planWithSubscription = {
        ...planResult.data,
        subscription: subscriptionResult.data
      };

      setSelectedPlanForDetail(planWithSubscription);
      setIsPlanDetailDialogOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement du plan:', error);
      toast.error('Erreur lors du chargement des détails du plan');
    }
  };

  const handleCancelSubscription = async (payment: SubscriptionPayment) => {
    try {
      // Vérifier d'abord si l'abonnement existe et est actif
      const { data: existingSubscription, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id, status, start_date, end_date')
        .eq('user_id', payment.userId)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) {
        console.error('Erreur lors de la vérification:', checkError);
        throw new Error('Erreur lors de la vérification de l\'abonnement');
      }

      if (!existingSubscription) {
        toast.error('Aucun abonnement actif trouvé pour cet utilisateur');
        setIsCancelDialogOpen(false);
        setSelectedPayment(null);
        return;
      }

      // Annuler l'abonnement de l'utilisateur
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (subscriptionError) {
        console.error('Erreur mise à jour abonnement:', subscriptionError);
        throw new Error('Erreur lors de la mise à jour de l\'abonnement: ' + subscriptionError.message);
      }

      // Marquer le paiement comme annulé
      const { error: paymentError } = await supabase
        .from('billing_history')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (paymentError) {
        console.error('Erreur mise à jour paiement:', paymentError);
        // Ne pas échouer si la mise à jour du paiement échoue
        console.warn('Impossible de mettre à jour le statut du paiement, mais l\'abonnement a été annulé');
      }

      // Log de l'action administrative
      try {
        await supabase
          .from('admin_action_logs')
          .insert({
            admin_id: (await supabase.auth.getUser()).data.user?.id,
            action_type: 'subscription_cancellation',
            target_id: payment.userId,
            target_type: 'user',
            details: {
              subscription_id: existingSubscription.id,
              payment_id: payment.id,
              plan_name: payment.planName,
              agency_name: payment.agencyName,
              reason: 'Annulation manuelle par l\'administrateur'
            }
          });
      } catch (logError) {
        console.error('Erreur lors du logging:', logError);
        // Ne pas échouer si le logging échoue
      }

      toast.success('Abonnement annulé avec succès');
      setIsCancelDialogOpen(false);
      setSelectedPayment(null);
      loadPayments(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(`Erreur lors de l'annulation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDeletePayment = async (payment: SubscriptionPayment) => {
    try {
      // Supprimer l'enregistrement de paiement
      const { error } = await supabase
        .from('billing_history')
        .delete()
        .eq('id', payment.id);

      if (error) throw error;

      // Log de l'action administrative
      await supabase
        .from('admin_action_logs')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'payment_deletion',
          target_id: payment.userId,
          target_type: 'user',
          details: {
            payment_id: payment.id,
            plan_name: payment.planName,
            agency_name: payment.agencyName,
            amount: payment.amount,
            reason: 'Suppression manuelle par l\'administrateur'
          }
        });

      toast.success('Paiement supprimé avec succès');
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      loadPayments(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du paiement');
    }
  };

  // Filtrer les paiements selon les critères
  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      payment.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUserAgencies = userAgencies.filter(user => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.agency_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des paiements d'abonnement</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les paiements et activations d'abonnement des agences
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button 
            onClick={() => setIsManualActivationDialogOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm h-10"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Activer/Upgrader Abonnement</span>
            <span className="sm:hidden">Activer Abonnement</span>
          </Button>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Label htmlFor="auto-activation" className="text-sm">Activation automatique</Label>
            <Switch
              id="auto-activation"
              checked={autoActivation}
              onCheckedChange={handleAutoActivationToggle}
            />
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total paiements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="manual-history">Activations Manuelles</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-medium">Rechercher</Label>
                  <Input
                    id="search"
                    placeholder="Nom d'agence, email, plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium">Statut</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="failed">Échoué</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des paiements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des paiements</CardTitle>
              <CardDescription>
                Liste de tous les paiements d'abonnement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="min-w-[150px]">Agence</TableHead>
                      <TableHead className="min-w-[200px] hidden sm:table-cell">Email</TableHead>
                      <TableHead className="min-w-[100px]">Plan</TableHead>
                      <TableHead className="min-w-[100px]">Montant</TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">Méthode</TableHead>
                      <TableHead className="min-w-[100px]">Statut</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{payment.agencyName}</TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{payment.userEmail}</TableCell>
                      <TableCell className="text-sm">{payment.planName}</TableCell>
                      <TableCell className="text-sm font-semibold">{payment.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="text-sm capitalize hidden md:table-cell">{payment.paymentMethod}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {payment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsActivationDialogOpen(true);
                              }}
                            >
                              Activer
                            </Button>
                          )}
                          
                          {/* Menu déroulant des actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem 
                                onClick={() => handleViewPlanDetails(payment)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails du plan
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsEditDialogOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier le statut
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {payment.status === 'paid' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setIsCancelDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-orange-600 focus:text-orange-600"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Annuler l'abonnement
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer le paiement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Dialog de modification (maintenu pour compatibilité) */}
                          <Dialog open={isEditDialogOpen && selectedPayment?.id === payment.id} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier le paiement</DialogTitle>
                                <DialogDescription>
                                  Modifiez le statut du paiement
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="status">Statut</Label>
                                  <Select
                                    value={payment.status}
                                    onValueChange={(value) => handleStatusChange(payment.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">En attente</SelectItem>
                                      <SelectItem value="paid">Payé</SelectItem>
                                      <SelectItem value="failed">Échoué</SelectItem>
                                      <SelectItem value="cancelled">Annulé</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Annuler
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Historique des Activations Manuelles
              </CardTitle>
              <CardDescription>
                Liste des 30 dernières activations manuelles d'abonnements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualActivationHistory.map((activation) => (
                    <TableRow key={activation.id}>
                      <TableCell>
                        {new Date(activation.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {activation.profiles?.first_name} {activation.profiles?.last_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {activation.profiles?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{activation.agencies?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {activation.subscription_plans?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {activation.amount?.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={activation.description}>
                        {activation.description}
                      </TableCell>
                    </TableRow>
                  ))}
                  {manualActivationHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucune activation manuelle trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'activation manuelle */}
      <AlertDialog open={isActivationDialogOpen} onOpenChange={setIsActivationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer l'abonnement manuellement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir activer manuellement cet abonnement ?
              Cela marquera le paiement comme effectué et activera l'abonnement pour l'agence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPayment && handleManualActivation(selectedPayment.id)}
            >
              Activer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog d'activation/upgrade manuel d'abonnement */}
      <Dialog open={isManualActivationDialogOpen} onOpenChange={setIsManualActivationDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Crown className="h-4 w-4 text-yellow-600" />
              Activer/Upgrader un Abonnement
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Sélectionnez un utilisateur agence et le plan d'abonnement à activer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Sélection de l'utilisateur */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="user-search" className="text-sm font-medium">
                  Sélectionner un utilisateur
                </Label>
                <Input
                  id="user-search"
                  placeholder="Rechercher par email, nom ou agence..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Utilisateur</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="text-sm h-auto min-h-[36px] py-2">
                    <SelectValue placeholder="Choisir un utilisateur" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] w-full">
                    {filteredUserAgencies.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="py-3">
                        <div className="flex flex-col space-y-1 w-full">
                          <span className="font-medium text-sm truncate">
                            ({user.email})
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-sm text-foreground">
                              {user.first_name} {user.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Agence: {user.agency_name || 'N/A'}
                            </span>
                          </div>
                          {user.current_plan && (
                            <span className="text-xs text-blue-600 font-medium">
                              Plan actuel: {user.current_plan}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sélection du plan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Plan d'abonnement</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="text-sm h-auto min-h-[36px] py-2">
                  <SelectValue placeholder="Sélectionner un plan d'abonnement" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="py-3">
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-sm">{plan.name}</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {plan.price.toLocaleString()} FCFA
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          Facturation: {plan.billing_cycle === 'monthly' ? 'mensuelle' : 
                                       plan.billing_cycle === 'yearly' ? 'annuelle' : plan.billing_cycle}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection de la méthode de paiement */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Méthode de paiement</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Sélectionner une méthode de paiement" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id} className="py-2">
                      <div className="flex flex-col w-full">
                        <span className="text-sm font-medium">{method.name}</span>
                        {method.description && (
                          <span className="text-xs text-muted-foreground">
                            {method.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code promo (optionnel) */}
            <div className="space-y-2">
              <Label htmlFor="promo-code" className="text-sm font-medium">
                Code promo (optionnel)
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="promo-code"
                  placeholder="Entrer un code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="text-sm h-9 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={validatePromoCode}
                  disabled={!promoCode || !selectedUser || !selectedPlan}
                  className="text-xs h-9 px-4 w-full sm:w-auto"
                >
                  Valider
                </Button>
              </div>
              
              {/* Validation du code promo */}
              {promoValidation && (
                <div className={`p-3 rounded-lg text-sm border ${
                  promoValidation.valid 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {promoValidation.valid ? (
                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-1">
                        <span className="text-green-600">✓</span>
                        {promoValidation.promo_name}
                      </p>
                      <p className="text-sm">
                        Réduction: <span className="font-semibold">
                          {promoValidation.discount_amount?.toLocaleString()} FCFA
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1">
                      <span className="text-red-600">✗</span>
                      {promoValidation.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Note administrative (optionnelle) */}
            <div className="space-y-2">
              <Label htmlFor="admin-note" className="text-sm font-medium">
                Note administrative (optionnelle)
              </Label>
              <Input
                id="admin-note"
                placeholder="Ajouter une note pour cette activation..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="text-sm h-9"
              />
            </div>

            {/* Aperçu de la sélection */}
            {selectedUser && selectedPlan && selectedPaymentMethod && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-4 pb-4">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Aperçu de l'activation
                  </h4>
                  <div className="space-y-2 text-sm">
                    {/* Informations utilisateur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Utilisateur:</span>
                        <p className="font-medium">
                          {userAgencies.find(u => u.id === selectedUser)?.first_name} {userAgencies.find(u => u.id === selectedUser)?.last_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium text-xs break-all">
                          {userAgencies.find(u => u.id === selectedUser)?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Agence:</span>
                        <p className="font-medium">
                          {userAgencies.find(u => u.id === selectedUser)?.agency_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Plan actuel:</span>
                        <p className="font-medium">
                          {userAgencies.find(u => u.id === selectedUser)?.current_plan || 'Aucun'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Nouveau plan:</span>
                          <p className="font-semibold text-blue-800">
                            {subscriptionPlans.find(p => p.id === selectedPlan)?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const plan = subscriptionPlans.find(p => p.id === selectedPlan);
                              if (!plan) return '';
                              const cycle = plan.billing_cycle;
                              return cycle === 'monthly' ? 'Plan mensuel' : 
                                     cycle === 'annual' || cycle === 'yearly' ? 'Plan annuel' :
                                     cycle === 'quarterly' ? 'Plan trimestriel' :
                                     cycle === 'semestriel' || cycle === 'semestrial' ? 'Plan semestriel' :
                                     cycle === 'weekly' ? 'Plan hebdomadaire' : 
                                     `Plan ${cycle}`;
                            })()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Méthode de paiement:</span>
                          <p className="font-medium">
                            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                          </p>
                        </div>
                      </div>
                      
                      {/* Période d'abonnement calculée */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-muted-foreground">Date de début:</span>
                          <p className="font-medium text-green-700">
                            {new Date().toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date d'expiration:</span>
                          <p className="font-medium text-blue-700">
                            {(() => {
                              const plan = subscriptionPlans.find(p => p.id === selectedPlan);
                              if (!plan) return 'Non calculée';
                              
                              const now = new Date();
                              let endDate = new Date(now);
                              
                              switch (plan.billing_cycle) {
                                case 'monthly':
                                  endDate.setMonth(endDate.getMonth() + 1);
                                  break;
                                case 'annual':
                                case 'yearly':
                                  endDate.setFullYear(endDate.getFullYear() + 1);
                                  break;
                                case 'quarterly':
                                  endDate.setMonth(endDate.getMonth() + 3);
                                  break;
                                case 'semestriel':
                                case 'semestrial':
                                  endDate.setMonth(endDate.getMonth() + 6);
                                  break;
                                case 'weekly':
                                  endDate.setDate(endDate.getDate() + 7);
                                  break;
                                default:
                                  endDate.setMonth(endDate.getMonth() + 1);
                              }
                              
                              return endDate.toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {(() => {
                      const originalPrice = subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0;
                      const finalPrice = promoValidation?.valid ? promoValidation.final_amount || originalPrice : originalPrice;
                      const discount = promoValidation?.valid ? promoValidation.discount_amount || 0 : 0;
                      
                      return (
                        <div className="pt-3 border-t border-blue-200">
                          <div className="bg-white rounded-lg p-3 border border-blue-100">
                            {discount > 0 && (
                              <div className="space-y-1 mb-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Prix original:</span>
                                  <span className="line-through text-gray-500 text-sm">
                                    {originalPrice.toLocaleString()} FCFA
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Réduction ({promoCode}):</span>
                                  <span className="text-green-600 font-medium">
                                    -{discount.toLocaleString()} FCFA
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                              <span className="font-medium text-blue-900">Prix final:</span>
                              <span className="text-lg font-bold text-blue-700">
                                {finalPrice.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {adminNote && (
                      <div className="pt-2 border-t border-blue-200">
                        <span className="text-muted-foreground">Note:</span>
                        <p className="font-medium text-sm italic">{adminNote}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsManualActivationDialogOpen(false);
                resetActivationForm();
              }}
              className="w-full sm:w-auto text-sm h-10"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleManualSubscriptionActivation}
              disabled={!selectedUser || !selectedPlan || !selectedPaymentMethod || isProcessing}
              className="w-full sm:w-auto text-sm h-10 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Activer l'abonnement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog détails du plan */}
      <Dialog open={isPlanDetailDialogOpen} onOpenChange={setIsPlanDetailDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Détails du plan d'abonnement
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur le plan sélectionné
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlanForDetail && (
            <div className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedPlanForDetail.name}</CardTitle>
                  <CardDescription>
                    Plan {selectedPlanForDetail.billing_cycle === 'monthly' ? 'mensuel' : 
                          (selectedPlanForDetail.billing_cycle === 'annual' || selectedPlanForDetail.billing_cycle === 'yearly') ? 'annuel' :
                          selectedPlanForDetail.billing_cycle === 'quarterly' ? 'trimestriel' :
                          (selectedPlanForDetail.billing_cycle === 'semestriel' || selectedPlanForDetail.billing_cycle === 'semestrial') ? 'semestriel' :
                          selectedPlanForDetail.billing_cycle === 'weekly' ? 'hebdomadaire' :
                          selectedPlanForDetail.billing_cycle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Prix</Label>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedPlanForDetail.price.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Facturation</Label>
                      <p className="text-lg font-medium capitalize">
                        {selectedPlanForDetail.billing_cycle === 'monthly' ? 'Mensuelle' : 
                         (selectedPlanForDetail.billing_cycle === 'annual' || selectedPlanForDetail.billing_cycle === 'yearly') ? 'Annuelle' :
                         selectedPlanForDetail.billing_cycle === 'quarterly' ? 'Trimestrielle' :
                         (selectedPlanForDetail.billing_cycle === 'semestriel' || selectedPlanForDetail.billing_cycle === 'semestrial') ? 'Semestrielle' :
                         selectedPlanForDetail.billing_cycle === 'weekly' ? 'Hebdomadaire' :
                         selectedPlanForDetail.billing_cycle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Période d'abonnement */}
              {selectedPlanForDetail.subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      Période d'abonnement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date de début</Label>
                        <p className="text-lg font-medium">
                          {selectedPlanForDetail.subscription.start_date 
                            ? new Date(selectedPlanForDetail.subscription.start_date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Non définie'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date de fin</Label>
                        <p className="text-lg font-medium">
                          {(() => {
                            // Si on a une date de fin dans la DB, on l'utilise
                            if (selectedPlanForDetail.subscription.end_date) {
                              return new Date(selectedPlanForDetail.subscription.end_date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            }
                            
                            // Sinon, on calcule selon le cycle de facturation et la date de début
                            if (selectedPlanForDetail.subscription.start_date) {
                              const startDate = new Date(selectedPlanForDetail.subscription.start_date);
                              const endDate = new Date(startDate);
                              
                              switch (selectedPlanForDetail.billing_cycle) {
                                case 'monthly':
                                  endDate.setMonth(endDate.getMonth() + 1);
                                  break;
                                case 'annual':
                                case 'yearly':
                                  endDate.setFullYear(endDate.getFullYear() + 1);
                                  break;
                                case 'quarterly':
                                  endDate.setMonth(endDate.getMonth() + 3);
                                  break;
                                case 'weekly':
                                  endDate.setDate(endDate.getDate() + 7);
                                  break;
                                case 'semestriel':
                                case 'semestrial':
                                  endDate.setMonth(endDate.getMonth() + 6);
                                  break;
                                default:
                                  endDate.setMonth(endDate.getMonth() + 1);
                              }
                              
                              return endDate.toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            }
                            
                            return 'Non calculable';
                          })()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                        <Badge 
                          variant={
                            selectedPlanForDetail.subscription.status === 'active' ? 'default' :
                            selectedPlanForDetail.subscription.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {selectedPlanForDetail.subscription.status === 'active' ? 'Actif' :
                           selectedPlanForDetail.subscription.status === 'cancelled' ? 'Annulé' :
                           selectedPlanForDetail.subscription.status === 'expired' ? 'Expiré' :
                           selectedPlanForDetail.subscription.status
                          }
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Dernière mise à jour</Label>
                        <p className="text-sm">
                          {selectedPlanForDetail.subscription.updated_at 
                            ? new Date(selectedPlanForDetail.subscription.updated_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Inconnue'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Limites */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Limites et quotas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Propriétés max:</span>
                        <Badge variant="outline">
                          {selectedPlanForDetail.max_properties === -1 ? 'Illimité' : selectedPlanForDetail.max_properties}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Agences max:</span>
                        <Badge variant="outline">
                          {selectedPlanForDetail.max_agencies === -1 ? 'Illimité' : selectedPlanForDetail.max_agencies}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Baux max:</span>
                        <Badge variant="outline">
                          {selectedPlanForDetail.max_leases === -1 ? 'Illimité' : selectedPlanForDetail.max_leases}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Utilisateurs max:</span>
                        <Badge variant="outline">
                          {selectedPlanForDetail.max_users === -1 ? 'Illimité' : selectedPlanForDetail.max_users}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fonctionnalités */}
              {selectedPlanForDetail.features && selectedPlanForDetail.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fonctionnalités incluses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedPlanForDetail.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPlanDetailDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" />
              Annuler l'abonnement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler l'abonnement de <strong>{selectedPayment?.agencyName}</strong> ?
              <br />
              <br />
              Cette action va :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Désactiver immédiatement l'abonnement</li>
                <li>Marquer le paiement comme annulé</li>
                <li>Empêcher l'accès aux fonctionnalités premium</li>
              </ul>
              <br />
              <span className="text-orange-600 font-medium">Cette action ne peut pas être annulée.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPayment && handleCancelSubscription(selectedPayment)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Supprimer le paiement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement ce paiement ?
              <br />
              <br />
              <strong>Détails du paiement :</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Agence: {selectedPayment?.agencyName}</li>
                <li>Plan: {selectedPayment?.planName}</li>
                <li>Montant: {selectedPayment?.amount.toLocaleString()} FCFA</li>
                <li>Email: {selectedPayment?.userEmail}</li>
              </ul>
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ Cette action est irréversible. Le paiement sera définitivement supprimé de la base de données.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPayment && handleDeletePayment(selectedPayment)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
