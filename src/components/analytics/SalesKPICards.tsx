import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Home,
  Users,
  Percent,
  Activity,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AgencySalesStats, MarketComparisonData } from '@/services/sales/agencySalesAnalyticsService';

interface SalesKPICardsProps {
  stats: AgencySalesStats;
  marketComparison?: MarketComparisonData;
  isLoading?: boolean;
}

export default function SalesKPICards({ stats, marketComparison, isLoading }: SalesKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Propriétés en vente',
      value: stats.totalForSale,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: 'actives sur le marché'
    },
    {
      title: 'Valeur totale du portfolio',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: 'valeur de l\'inventaire'
    },
    {
      title: 'Prix moyen',
      value: formatCurrency(stats.averagePrice),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: marketComparison ? (
        <div className="flex items-center gap-1">
          {marketComparison.relativePricing > 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+{marketComparison.relativePricing.toFixed(1)}% vs marché</span>
            </>
          ) : marketComparison.relativePricing < 0 ? (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-600">{marketComparison.relativePricing.toFixed(1)}% vs marché</span>
            </>
          ) : (
            <span className="text-gray-600">≈ prix du marché</span>
          )}
        </div>
      ) : 'prix moyen des propriétés'
    },
    {
      title: 'Ventes complétées',
      value: stats.completedSales,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: `+ ${stats.pendingSales} en cours`
    },
    {
      title: 'Revenus totaux',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      subtitle: 'depuis le début'
    },
    {
      title: 'Commissions',
      value: formatCurrency(stats.totalCommissions),
      icon: Percent,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtitle: `${stats.averageCommissionRate.toFixed(1)}% en moyenne`
    },
    {
      title: 'Temps moyen de vente',
      value: `${Math.round(stats.averageDaysOnMarket)} jours`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: marketComparison ? (
        <div className="flex items-center gap-1">
          {stats.averageDaysOnMarket < marketComparison.marketVelocity ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Plus rapide que le marché</span>
            </>
          ) : stats.averageDaysOnMarket > marketComparison.marketVelocity ? (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-600">Plus lent que le marché</span>
            </>
          ) : (
            <span className="text-gray-600">≈ vitesse du marché</span>
          )}
        </div>
      ) : 'pour finaliser une vente'
    },
    {
      title: 'Taux de conversion',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      subtitle: 'propriétés vendues/listées',
      progress: stats.conversionRate
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((kpi, index) => {
        const IconComponent = kpi.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <div className="text-xs text-muted-foreground">
                    {typeof kpi.subtitle === 'string' ? (
                      kpi.subtitle
                    ) : (
                      kpi.subtitle
                    )}
                  </div>
                  
                  {/* Barre de progression pour certains KPI */}
                  {kpi.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={Math.min(kpi.progress, 100)} className="h-2" />
                    </div>
                  )}
                </div>
                
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Carte spéciale pour le statut des ventes */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Répartition des ventes</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedSales}</div>
              <div className="text-sm text-green-700">Ventes complétées</div>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                Succès
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingSales}</div>
              <div className="text-sm text-orange-700">En négociation</div>
              <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800">
                En cours
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.cancelledSales}</div>
              <div className="text-sm text-gray-700">Annulées</div>
              <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-800">
                Abandonnées
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
