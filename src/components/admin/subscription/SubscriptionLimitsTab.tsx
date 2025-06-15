
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building, Crown, Package, Users } from 'lucide-react';
import { SubscriptionPlan } from '@/assets/types';

interface SubscriptionLimitsTabProps {
  plans: SubscriptionPlan[];
}

export default function SubscriptionLimitsTab({ plans }: SubscriptionLimitsTabProps) {
  return (
    <div className="grid gap-6">
      {plans.filter(p => p.isActive).map((plan) => (
        <div key={plan.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <Badge variant={plan.popular ? "default" : "secondary"}>
              {plan.price.toLocaleString()} FCFA/{plan.billingCycle === 'monthly' ? 'mois' : 'an'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded">
              <Building className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="font-semibold">{plan.maxProperties}</div>
              <div className="text-sm text-muted-foreground">Propriétés</div>
            </div>
            <div className="text-center p-3 bg-muted rounded">
              <Crown className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="font-semibold">{plan.maxAgencies}</div>
              <div className="text-sm text-muted-foreground">Agences</div>
            </div>
            <div className="text-center p-3 bg-muted rounded">
              <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="font-semibold">{plan.maxLeases}</div>
              <div className="text-sm text-muted-foreground">Baux</div>
            </div>
            <div className="text-center p-3 bg-muted rounded">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="font-semibold">{plan.maxUsers}</div>
              <div className="text-sm text-muted-foreground">Utilisateurs</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
