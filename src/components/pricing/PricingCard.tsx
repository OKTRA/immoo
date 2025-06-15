
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
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

  return (
    <Card 
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
            onClick={() => onUpgrade(plan.id)}
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
}
