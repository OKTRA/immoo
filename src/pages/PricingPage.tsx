
import React, { useState, useEffect } from 'react';
import { getAllSubscriptionPlans } from '@/services/subscriptionService';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';
import PricingHeader from '@/components/pricing/PricingHeader';
import PricingCard from '@/components/pricing/PricingCard';
import PricingFooter from '@/components/pricing/PricingFooter';
import PricingLoadingState from '@/components/pricing/PricingLoadingState';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            <Button asChild variant="ghost" className="group hover:bg-white/50 dark:hover:bg-gray-800/50">
              <Link to="/agencies" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Retour aux agences
              </Link>
            </Button>
          </div>

          <PricingHeader subscription={subscription} />
        </div>
      </div>

      {/* Plans Section */}
      <div className="container mx-auto px-4 pb-20">
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

        <PricingFooter />
      </div>
    </div>
  );
}
