
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { getAllSubscriptionPlans } from '@/services/subscriptionService';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const { subscription, upgradeSubscription, isFreePlan } = useUserSubscription();

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

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return <Star className="h-6 w-6" />;
    if (plan.price > 50000) return <Crown className="h-6 w-6" />;
    return <Zap className="h-6 w-6" />;
  };

  const getCurrentPlanId = () => subscription?.planId;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* En-tête */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Développez votre activité immobilière avec nos plans adaptés à tous vos besoins
        </p>
      </div>

      {/* Affichage du plan actuel */}
      {subscription && (
        <div className="text-center mb-8">
          <Badge variant="outline" className="text-sm px-3 py-1">
            Plan actuel: {subscription.plan?.name} 
            {subscription.plan?.price === 0 ? ' (Gratuit)' : ` - ${subscription.plan?.price.toLocaleString()} FCFA/mois`}
          </Badge>
        </div>
      )}

      {/* Grille des plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === getCurrentPlanId();
          const isUpgradable = subscription && plan.price > (subscription.plan?.price || 0);
          const isPremium = plan.price > 0;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${isPremium ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Recommandé
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {getPlanIcon(plan)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-primary">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">
                      /{plan.billingCycle === 'monthly' ? 'mois' : 'an'}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Limites principales */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Agences:</span>
                    <span className="font-semibold">
                      {plan.maxAgencies === 999999 ? 'Illimité' : plan.maxAgencies}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Propriétés:</span>
                    <span className="font-semibold">
                      {plan.maxProperties === 999999 ? 'Illimité' : plan.maxProperties}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Baux:</span>
                    <span className="font-semibold">
                      {plan.maxLeases === 999999 ? 'Illimité' : plan.maxLeases}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Utilisateurs:</span>
                    <span className="font-semibold">
                      {plan.maxUsers === 999999 ? 'Illimité' : plan.maxUsers}
                    </span>
                  </div>
                </div>

                {/* Fonctionnalités */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Bouton d'action */}
                {isCurrentPlan ? (
                  <Button disabled className="w-full">
                    Plan actuel
                  </Button>
                ) : isUpgradable ? (
                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {upgrading === plan.id ? 'Mise à niveau...' : 'Passer à ce plan'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    {plan.price === 0 ? 'Plan gratuit' : 'Rétrogradation non disponible'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer informatif */}
      <div className="text-center mt-12 space-y-4">
        <p className="text-muted-foreground">
          Tous les plans incluent notre support technique et les mises à jour automatiques
        </p>
        <p className="text-sm text-muted-foreground">
          Méthodes de paiement: Mobile Money, Virement bancaire, Paiement manuel
        </p>
      </div>
    </div>
  );
}
