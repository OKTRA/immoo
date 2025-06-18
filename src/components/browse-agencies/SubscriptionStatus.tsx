import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LimitWarning from '@/components/subscription/LimitWarning';
import { UserSubscription } from '@/services/subscription';
import { Crown, Building2, CheckCircle, AlertTriangle } from 'lucide-react';

interface SubscriptionStatusProps {
  user: any;
  subscription: UserSubscription | null;
  agencyLimit: { allowed: boolean; currentCount: number; maxAllowed: number; percentageUsed: number } | null;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ user, subscription, agencyLimit }) => {
  if (!user) return null;

  return (
    <>
      {/* Limit Warning */}
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

      {/* Subscription Status Card */}
      {subscription && (
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-white via-immoo-pearl/30 to-immoo-gold/10 border-immoo-gold/20 shadow-lg">
          <CardHeader className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-immoo-navy/5 via-transparent to-immoo-gold/5" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-immoo-gold to-immoo-navy rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                
                <div>
                  <CardTitle className="text-xl text-immoo-navy flex items-center gap-2">
                    Votre abonnement actuel
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Gérez vos agences et propriétés en toute simplicité
                  </CardDescription>
                </div>
              </div>

              {/* Plan Badge */}
              <Badge 
                className="bg-gradient-to-r from-immoo-gold to-immoo-navy text-white px-4 py-2 text-sm font-medium shadow-lg"
              >
                Plan {subscription.plan?.name}
              </Badge>
            </div>

            {/* Usage Statistics */}
            {agencyLimit && (
              <div className="relative mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-immoo-gold" />
                    <span className="font-medium text-gray-900">Utilisation des agences</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-immoo-navy">{agencyLimit.currentCount}</span>
                    <span className="mx-1">/</span>
                    <span>{agencyLimit.maxAllowed}</span>
                  </div>
                </div>
                
                <Progress 
                  value={agencyLimit.percentageUsed} 
                  className="h-2 bg-gray-200"
                />
                
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500">
                    {agencyLimit.percentageUsed}% utilisé
                  </span>
                  {agencyLimit.percentageUsed > 80 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Limite proche</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
        </Card>
      )}
    </>
  );
};
