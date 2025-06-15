
import React, { useState, useEffect } from 'react';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useSubscriptionPayment } from '@/hooks/subscription/useSubscriptionPayment';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';
import PricingHeader from '@/components/pricing/PricingHeader';
import PricingCard from '@/components/pricing/PricingCard';
import PricingFooter from '@/components/pricing/PricingFooter';
import PricingLoadingState from '@/components/pricing/PricingLoadingState';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { subscription, upgradeSubscription, reloadSubscription } = useUserSubscription();
  const { processSubscriptionPayment } = useSubscriptionPayment();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('PricingPage: Auth state', { user: user?.id, authLoading, subscription: subscription?.id });
  }, [user, authLoading, subscription]);

  useEffect(() => {
    // Attendre que l'auth soit prête avant de charger les plans
    if (!authLoading) {
      loadPlans();
    }
  }, [authLoading]);

  // Gérer le retour de paiement
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const transactionId = searchParams.get('transaction_id');

    if (paymentStatus === 'success' && transactionId) {
      toast.success('Paiement effectué avec succès!');
      // Recharger l'abonnement après un paiement réussi
      reloadSubscription();
      
      // Nettoyer les paramètres URL
      navigate('/pricing', { replace: true });
    } else if (paymentStatus === 'cancel') {
      toast.info('Paiement annulé');
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate, reloadSubscription]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('PricingPage: Loading subscription plans...');
      
      let query = supabase.from('subscription_plans').select('*').eq('is_active', true);
      const { data: allPlans, error: queryError } = await query;
      
      if (queryError) {
        console.error('PricingPage: Error loading plans:', queryError);
        setError(`Erreur: ${queryError.message}`);
        toast.error(`Erreur: ${queryError.message}`);
        return;
      }
      
      if (!allPlans || allPlans.length === 0) {
        console.log('PricingPage: No plans returned');
        setPlans([]);
        setLoading(false);
        return;
      }
      
      // Trier par prix croissant
      const sortedPlans = allPlans.sort((a, b) => a.price - b.price).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
      }));
      setPlans(sortedPlans as SubscriptionPlan[]);
      console.log('PricingPage: Plans loaded successfully:', sortedPlans.length, 'plans');
      
    } catch (error) {
      console.error('PricingPage: Error loading plans:', error);
      const errorMessage = 'Erreur lors du chargement des plans';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      console.log('PricingPage: Upgrading to plan:', planId);
      
      // Trouver le plan sélectionné
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        toast.error('Plan non trouvé');
        return;
      }

      // Si c'est un plan gratuit, l'activer directement
      if (selectedPlan.price === 0) {
        const success = await upgradeSubscription(planId, undefined, 'free');
        if (success) {
          console.log('PricingPage: Free plan upgrade successful');
          toast.success('Plan mis à jour avec succès');
        }
      } else {
        // Pour les plans payants, le paiement sera géré par le dialog
        // La mise à niveau se fera après confirmation du paiement
        console.log('PricingPage: Paid plan selected, payment dialog will handle upgrade');
      }
    } catch (error) {
      console.error('PricingPage: Error upgrading:', error);
      toast.error('Erreur lors de la mise à niveau');
    } finally {
      setUpgrading(null);
    }
  };

  const handleBackToAgencies = () => {
    console.log('PricingPage: Navigating back to agencies');
    navigate('/agencies');
  };

  // Afficher le loading pendant que l'auth se charge
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <PricingLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Section avec retour */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Bouton de retour */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="group hover:bg-white/50 dark:hover:bg-gray-800/50"
              onClick={handleBackToAgencies}
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Retour aux agences
            </Button>
          </div>

          <PricingHeader subscription={subscription} />
        </div>
      </div>

      {/* Plans Section */}
      <div className="container mx-auto px-4 pb-20">
        {error ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2 text-red-600 dark:text-red-400">Erreur de chargement</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={loadPlans}>
              Réessayer
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">Aucun plan disponible</h3>
            <p className="text-muted-foreground mb-6">
              Les plans d'abonnement ne sont pas encore configurés
            </p>
            <Button onClick={loadPlans}>
              Actualiser
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={plan.id} 
                className="transform transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PricingCard
                  plan={plan}
                  subscription={subscription}
                  upgrading={upgrading}
                  onUpgrade={handleUpgrade}
                />
              </div>
            ))}
          </div>
        )}

        <PricingFooter />
      </div>
    </div>
  );
}
