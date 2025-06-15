
import React, { useState, useEffect } from 'react';
import { getAllSubscriptionPlans } from '@/services/subscriptionService';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';
import PricingHeader from '@/components/pricing/PricingHeader';
import PricingCard from '@/components/pricing/PricingCard';
import PricingFooter from '@/components/pricing/PricingFooter';
import PricingLoadingState from '@/components/pricing/PricingLoadingState';

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { subscription, upgradeSubscription } = useUserSubscription();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { plans: allPlans, error } = await getAllSubscriptionPlans(true);
      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }
      // Trier par prix croissant
      const sortedPlans = allPlans.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const success = await upgradeSubscription(planId, undefined, 'manual');
      if (success) {
        // Rediriger ou afficher une confirmation
      }
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return <PricingLoadingState />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PricingHeader subscription={subscription} />

      {/* Grille des plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            subscription={subscription}
            upgrading={upgrading}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      <PricingFooter />
    </div>
  );
}
