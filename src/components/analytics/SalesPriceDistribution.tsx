import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceRange } from '@/services/sales/agencySalesAnalyticsService';
import { PieChart as PieChartIcon, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SalesPriceDistributionProps {
  data: PriceRange[];
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SalesPriceDistribution({ data, isLoading }: SalesPriceDistributionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribution des prix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Temps de vente par gamme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrer les données qui ont des ventes
  const dataWithSales = data.filter(d => d.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribution en camembert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Distribution des prix de vente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataWithSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataWithSales}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ range, percentage }) => `${range} (${percentage.toFixed(1)}%)`}
                  labelLine={false}
                >
                  {dataWithSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} vente${value > 1 ? 's' : ''}`,
                    'Nombre de ventes'
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucune vente à afficher
            </div>
          )}
        </CardContent>
      </Card>

      {/* Temps de vente par gamme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Temps de vente moyen par gamme de prix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataWithSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataWithSales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="range" 
                  stroke="#64748b" 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b" 
                  tickLine={false}
                  fontSize={11}
                  label={{ value: 'Jours', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => [`${Math.round(value)} jours`, 'Temps moyen']}
                  labelFormatter={(label) => `Gamme: ${label}`}
                />
                <Bar 
                  dataKey="averageTime" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Temps moyen de vente"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucune donnée de temps de vente
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau récapitulatif */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Détail par gamme de prix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Gamme de prix</th>
                  <th className="text-right py-2 px-3">Nombre de ventes</th>
                  <th className="text-right py-2 px-3">Pourcentage</th>
                  <th className="text-right py-2 px-3">Temps moyen</th>
                </tr>
              </thead>
              <tbody>
                {data.map((range, index) => (
                  <tr key={range.range} className="border-b">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {range.range} FCFA
                      </div>
                    </td>
                    <td className="text-right py-2 px-3">{range.count}</td>
                    <td className="text-right py-2 px-3">{range.percentage.toFixed(1)}%</td>
                    <td className="text-right py-2 px-3">
                      {range.count > 0 ? `${Math.round(range.averageTime)} jours` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
