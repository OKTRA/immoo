import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { MonthlyPeriod } from '@/services/sales/agencySalesAnalyticsService';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface SalesPerformanceChartProps {
  data: MonthlyPeriod[];
  isLoading?: boolean;
}

export default function SalesPerformanceChart({ data, isLoading }: SalesPerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance des ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Performance des ventes mensuelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              tickLine={false}
              fontSize={12}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tickFormatter={(value) => formatCurrency(value, "")}
              stroke="#64748b" 
              tickLine={false}
              fontSize={11}
            />
            <YAxis 
              yAxisId="sales"
              orientation="right"
              stroke="#64748b" 
              tickLine={false}
              fontSize={11}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900 mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name}: {
                            entry.dataKey === 'revenue' || entry.dataKey === 'commissions' 
                              ? formatCurrency(entry.value as number)
                              : entry.dataKey === 'averagePrice'
                              ? formatCurrency(entry.value as number)
                              : `${entry.value}${entry.dataKey === 'averageDaysOnMarket' ? ' jours' : ''}`
                          }
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            
            {/* Barres pour les revenus */}
            <Bar 
              yAxisId="revenue"
              dataKey="revenue" 
              fill="#3b82f6" 
              name="Revenus" 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            
            {/* Barres pour les commissions */}
            <Bar 
              yAxisId="revenue"
              dataKey="commissions" 
              fill="#10b981" 
              name="Commissions" 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            
            {/* Ligne pour le nombre de ventes */}
            <Line 
              yAxisId="sales"
              type="monotone" 
              dataKey="sales" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Nombre de ventes"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
            />
            
            {/* Ligne pour le prix moyen */}
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="averagePrice" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Prix moyen"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
