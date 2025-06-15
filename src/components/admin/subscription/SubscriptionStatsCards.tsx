
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface SubscriptionStatsProps {
  stats: {
    totalPayments: number;
    pendingPayments: number;
    paidPayments: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
}

export default function SubscriptionStatsCards({ stats }: SubscriptionStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paiements</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPayments}</div>
          <p className="text-xs text-muted-foreground">
            Tous les paiements d'abonnements
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">
            Paiements non confirmés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.paidPayments}</div>
          <p className="text-xs text-muted-foreground">
            Abonnements activés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
          <p className="text-xs text-muted-foreground">
            Total encaissé
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
