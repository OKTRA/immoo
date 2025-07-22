import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ExpenseChartData, ExpenseByCategory } from '@/types/expenses';

interface ExpenseChartsProps {
  chartData: ExpenseChartData[] | ExpenseByCategory[];
  isLoading: boolean;
  type: 'line' | 'pie';
}

export default function ExpenseCharts({ chartData, isLoading, type }: ExpenseChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (type === 'line') {
    const data = chartData as ExpenseChartData[];
    const maxValue = Math.max(...data.map(d => Math.max(d.total, d.paid, d.pending, d.approved)));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Évolution mensuelle</h4>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Total</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Payées</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>En attente</span>
            </div>
          </div>
        </div>
        
        <div className="h-48 flex items-end justify-between space-x-2">
          {data.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex flex-col space-y-1">
                <div 
                  className="bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(month.total / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <div 
                  className="bg-green-500"
                  style={{ 
                    height: `${(month.paid / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <div 
                  className="bg-yellow-500 rounded-b"
                  style={{ 
                    height: `${(month.pending / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{month.month}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const data = chartData as ExpenseByCategory[];
    const total = data.reduce((sum, item) => sum + item.total_amount, 0);
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Répartition par catégorie</h4>
        
        <div className="space-y-3">
          {data.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.category_color }}
                ></div>
                <span className="text-sm">{category.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0
                  }).format(category.total_amount)}
                </div>
                <div className="text-xs text-gray-500">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div>Type de graphique non supporté</div>;
} 