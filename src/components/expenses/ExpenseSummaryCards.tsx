import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  Receipt
} from 'lucide-react';
import { ExpenseSummary } from '@/types/expenses';
import { cn } from '@/lib/utils';

interface ExpenseSummaryCardsProps {
  summary: ExpenseSummary | null;
  urgentCount: number;
  overdueCount: number;
  pendingAmount: number;
  isLoading: boolean;
}

export default function ExpenseSummaryCards({
  summary,
  urgentCount,
  overdueCount,
  pendingAmount,
  isLoading
}: ExpenseSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aucune donnée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 FCFA</div>
            <p className="text-xs text-muted-foreground">Aucune dépense enregistrée</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'approved':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'normal':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total des dépenses */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des dépenses</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.total_expenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.expenses_count} dépense(s) enregistrée(s)
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Moyenne: {formatCurrency(summary.average_expense)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dépenses payées */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses payées</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.total_paid)}
          </div>
          <p className="text-xs text-muted-foreground">
            {((summary.total_paid / summary.total_expenses) * 100).toFixed(1)}% du total
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(summary.total_paid / summary.total_expenses) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dépenses en attente */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(summary.total_pending)}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.total_pending > 0 ? (
              <>
                {overdueCount} en retard • {urgentCount} urgentes
              </>
            ) : (
              'Aucune dépense en attente'
            )}
          </p>
          {overdueCount > 0 && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {overdueCount} en retard
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dépenses récurrentes */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses récurrentes</CardTitle>
          <Receipt className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {summary.recurring_expenses_count}
          </div>
          <p className="text-xs text-muted-foreground">
            Dépenses automatiques configurées
          </p>
          {summary.recurring_expenses_count > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Automatisées
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 