
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Sparkles } from 'lucide-react';
import { SubscriptionPlan } from '@/assets/types';
import { UserSubscription } from '@/services/userSubscriptionService';

interface PricingCardProps {
  plan: SubscriptionPlan;
  subscription: UserSubscription | null;
  upgrading: string | null;
  onUpgrade: (planId: string) => void;
}

export default function PricingCard({ plan, subscription, upgrading, onUpgrade }: PricingCardProps) {
  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return <Star className="h-6 w-6" />;
    if (plan.price > 50000) return <Crown className="h-6 w-6" />;
    return <Zap className="h-6 w-6" />;
  };

  const getCurrentPlanId = () => subscription?.planId;
  
  const isCurrentPlan = plan.id === getCurrentPlanId();
  const isUpgradable = subscription && plan.price > (subscription.plan?.price || 0);
  const isPremium = plan.price > 0;
  const isPopular = plan.price > 0 && plan.price <= 50000;

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-0 ${
        isPremium 
          ? 'bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20' 
          : 'bg-white/70 dark:bg-gray-800/70'
      } backdrop-blur-lg ${
        isCurrentPlan 
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25' 
          : 'shadow-lg'
      }`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
      
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            Recommandé
          </Badge>
        </div>
      )}

      {/* Current plan indicator */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            Actuel
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4 relative z-10">
        <div className={`mx-auto mb-4 p-4 rounded-2xl w-fit ${
          isPremium 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {getPlanIcon(plan)}
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
        <CardDescription className="space-y-2">
          <div className={`text-4xl font-bold ${
            isPremium 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()}`}
            {plan.price > 0 && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                FCFA
              </span>
            )}
          </div>
          {plan.price > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              par {plan.billingCycle === 'monthly' ? 'mois' : 'an'}
            </p>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Limites principales avec design moderne */}
        <div className="bg-white/50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Limites incluses</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400">Agences</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {plan.maxAgencies === 999999 ? '∞' : plan.maxAgencies}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400">Propriétés</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {plan.maxProperties === 999999 ? '∞' : plan.maxProperties}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400">Baux</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {plan.maxLeases === 999999 ? '∞' : plan.maxLeases}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400">Utilisateurs</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {plan.maxUsers === 999999 ? '∞' : plan.maxUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Fonctionnalités</h4>
          <div className="space-y-2">
            {plan.features.slice(0, 5).map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
            {plan.features.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                +{plan.features.length - 5} autres fonctionnalités
              </p>
            )}
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="pt-4">
          {isCurrentPlan ? (
            <Button disabled className="w-full h-12 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              Plan actuel
            </Button>
          ) : isUpgradable ? (
            <Button 
              onClick={() => onUpgrade(plan.id)}
              disabled={upgrading === plan.id}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {upgrading === plan.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à niveau...
                </div>
              ) : (
                'Passer à ce plan'
              )}
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full h-12 border-gray-200 dark:border-gray-600">
              {plan.price === 0 ? 'Plan gratuit' : 'Rétrogradation non disponible'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
