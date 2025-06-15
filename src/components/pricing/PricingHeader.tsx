
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserSubscription } from '@/services/userSubscriptionService';

interface PricingHeaderProps {
  subscription: UserSubscription | null;
}

export default function PricingHeader({ subscription }: PricingHeaderProps) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
        Développez votre activité immobilière avec nos plans adaptés à tous vos besoins
      </p>
      
      {/* Affichage du plan actuel */}
      {subscription && (
        <div className="mb-8">
          <Badge variant="outline" className="text-sm px-3 py-1">
            Plan actuel: {subscription.plan?.name} 
            {subscription.plan?.price === 0 ? ' (Gratuit)' : ` - ${subscription.plan?.price.toLocaleString()} FCFA/mois`}
          </Badge>
        </div>
      )}
    </div>
  );
}
