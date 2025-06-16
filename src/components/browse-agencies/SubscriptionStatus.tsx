
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LimitWarning from '@/components/subscription/LimitWarning';
import { UserSubscription } from '@/services/subscription';

interface SubscriptionStatusProps {
  user: any;
  subscription: UserSubscription | null;
  agencyLimit: { allowed: boolean; currentCount: number; maxAllowed: number; percentageUsed: number } | null;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ user, subscription, agencyLimit }) => {
  return (
    <>
      {agencyLimit && !agencyLimit.allowed && (
        <div className="mb-6">
          <LimitWarning
            resourceType="agencies"
            currentCount={agencyLimit.currentCount}
            maxAllowed={agencyLimit.maxAllowed}
            onUpgrade={() => window.location.href = '/pricing'}
          />
        </div>
      )}

      {user && subscription && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Votre abonnement actuel</CardTitle>
            <CardDescription>
              Plan {subscription.plan?.name} - 
              {agencyLimit && (
                <span className="ml-2">
                  {agencyLimit.currentCount}/{agencyLimit.maxAllowed} agences utilisées
                  ({agencyLimit.percentageUsed}%)
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
};
