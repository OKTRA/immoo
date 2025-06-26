import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserSubscription } from '@/services/subscription';
import { Sparkles, Crown } from 'lucide-react';
import { getBillingCycleSuffix } from '@/utils/billingCycleUtils';

interface PricingHeaderProps {
  subscription: UserSubscription | null;
}

export default function PricingHeader({ subscription }: PricingHeaderProps) {
  return (
    <div className="text-center mb-16 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main heading */}
      <div className="space-y-6">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-full mb-6">
          <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Plans d'abonnement</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
          Choisissez votre plan
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Développez votre activité immobilière avec nos plans adaptés à tous vos besoins. 
          Des solutions flexibles pour tous les professionnels.
        </p>
      </div>
      
      {/* Plan actuel avec design moderne */}
      {subscription && (
        <div className="mt-10">
          <div className="inline-flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl px-6 py-4 shadow-lg">
            <Crown className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">Plan actuel</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {subscription.plan?.name}
                {subscription.plan?.price === 0 ? (
                  <span className="ml-2 text-green-600 dark:text-green-400">Gratuit</span>
                ) : (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    {subscription.plan?.price.toLocaleString()} FCFA{getBillingCycleSuffix(subscription.plan?.billing_cycle || 'monthly')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
