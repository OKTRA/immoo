import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign
} from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

interface PerformanceMetricsProps {
  className?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  className = ""
}) => {
  const metrics: MetricData[] = [
    {
      label: 'Taux d\'occupation',
      value: 85,
      target: 90,
      unit: '%',
      trend: 'up',
      trendValue: '+5%'
    },
    {
      label: 'Temps moyen de location',
      value: 12,
      target: 15,
      unit: 'jours',
      trend: 'down',
      trendValue: '-3 jours'
    },
    {
      label: 'Revenus mensuels',
      value: 75000,
      target: 80000,
      unit: '€',
      trend: 'up',
      trendValue: '+8%'
    },
    {
      label: 'Satisfaction client',
      value: 92,
      target: 95,
      unit: '%',
      trend: 'stable',
      trendValue: '0%'
    }
  ];

  const getTrendColor = (trend: MetricData['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-immoo-gray';
      default:
        return 'text-immoo-gray';
    }
  };

  const getTrendIcon = (trend: MetricData['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 rotate-180" />;
      case 'stable':
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-immoo-gray/30 shadow-lg ${className}`}>
      <CardHeader className="bg-gradient-to-r from-immoo-navy/5 to-immoo-gold/5">
        <CardTitle className="text-xl text-immoo-navy flex items-center">
          <Target className="h-5 w-5 mr-2 text-immoo-gold" />
          Métriques de performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const progressValue = (metric.value / metric.target) * 100;
            const isAboveTarget = metric.value >= metric.target;
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-immoo-navy">
                      {metric.label}
                    </span>
                    <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs font-medium">
                        {metric.trendValue}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-immoo-navy">
                      {metric.value.toLocaleString()}{metric.unit}
                    </span>
                    <div className="text-xs text-immoo-gray">
                      Objectif: {metric.target.toLocaleString()}{metric.unit}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={Math.min(progressValue, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-immoo-gray">
                    <span>0{metric.unit}</span>
                    <span 
                      className={`font-medium ${
                        isAboveTarget ? 'text-green-600' : 'text-immoo-gold'
                      }`}
                    >
                      {progressValue.toFixed(0)}% de l'objectif
                    </span>
                    <span>{metric.target.toLocaleString()}{metric.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-immoo-pearl/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-immoo-gold" />
            <span className="text-sm font-medium text-immoo-navy">
              Performance globale
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-immoo-gray">
              Score de performance mensuel
            </span>
            <span className="text-lg font-bold text-immoo-navy">
              87/100
            </span>
          </div>
          <Progress value={87} className="h-2 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;