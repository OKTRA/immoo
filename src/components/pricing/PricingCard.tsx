import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { SubscriptionPlan, UserSubscription } from '@/assets/types';
import SubscriptionPaymentDialog from '@/components/subscription/SubscriptionPaymentDialog';
import { getBillingCycleSuffix } from '@/utils/billingCycleUtils';

interface PricingCardProps {
  plan: SubscriptionPlan;
  subscription?: UserSubscription | null;
  upgrading?: string | null;
  onUpgrade: (planId: string) => void;
}

export default function PricingCard({ plan, subscription, upgrading, onUpgrade }: PricingCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const isCurrentPlan = subscription?.planId === plan.id;
  const isUpgrading = upgrading === plan.id;
  const isFreePlan = plan.price === 0;

  const handleSubscribe = () => {
    if (isFreePlan) {
      onUpgrade(plan.id);
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setShowPaymentDialog(false);
    onUpgrade(plan.id);
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Plan actuel';
    if (isFreePlan) return 'Choisir ce plan';
    return 'S\'abonner';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline' as const;
    if (plan.name.toLowerCase().includes('premium')) return 'default' as const;
    return 'outline' as const;
  };

  return (
    <>
      <Card className={`relative h-full flex flex-col ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
        {plan.name.toLowerCase().includes('premium') && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              Recommandé
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            {plan.name.toLowerCase().includes('enterprise') ? (
              <Crown className="w-6 h-6 text-yellow-500 mr-2" />
            ) : plan.name.toLowerCase().includes('premium') ? (
              <Zap className="w-6 h-6 text-purple-500 mr-2" />
            ) : null}
            <CardTitle className="text-xl">{plan.name}</CardTitle>
          </div>
          
          <div className="flex items-baseline justify-center mb-2">
            <span className="text-3xl font-bold">
              {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
            </span>
            {plan.price > 0 && (
              <span className="text-muted-foreground ml-1">
                {getBillingCycleSuffix(plan.billingCycle || 'monthly')}
              </span>
            )}
          </div>

          {isCurrentPlan && (
            <Badge variant="secondary" className="mx-auto">
              Votre plan actuel
            </Badge>
          )}
        </CardHeader>

        <CardContent className="flex-grow">
          <CardDescription className="text-center mb-6 min-h-[3rem]">
            {plan.name === 'Gratuit' && 'Parfait pour commencer'}
            {plan.name === 'Basic' && 'Idéal pour les petites agences'}
            {plan.name === 'Premium' && 'Pour les agences en croissance'}
            {plan.name === 'Enterprise' && 'Solution complète pour les grandes structures'}
          </CardDescription>

          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            
            <li className="flex items-start">
              <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                Jusqu'à {plan.maxProperties || 'illimité'} propriétés
              </span>
            </li>
            
            <li className="flex items-start">
              <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                Jusqu'à {plan.maxUsers || 'illimité'} utilisateurs
              </span>
            </li>
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSubscribe}
            disabled={isCurrentPlan || isUpgrading}
            variant={getButtonVariant()}
            className="w-full"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </CardFooter>
      </Card>

      <SubscriptionPaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        plan={plan}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
