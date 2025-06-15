
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, CreditCard, BarChart3 } from 'lucide-react';

interface SubscriptionPlansStatsProps {
  stats: {
    totalPlans: number;
    activePlans: number;
    totalSubscribers: number;
    monthlyRevenue: number;
  };
}

export default function SubscriptionPlansStatsCards({ stats }: SubscriptionPlansStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlans}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activePlans} actifs
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonnés</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
          <p className="text-xs text-muted-foreground">
            Plans souscrits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} FCFA</div>
          <p className="text-xs text-muted-foreground">
            Revenus des plans
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plans Actifs</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activePlans}</div>
          <p className="text-xs text-muted-foreground">
            Sur {stats.totalPlans} plans
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
