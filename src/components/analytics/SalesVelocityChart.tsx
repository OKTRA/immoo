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
import { Badge } from '@/components/ui/badge';
import { SalesVelocityData, MarketComparisonData } from '@/services/sales/agencySalesAnalyticsService';
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface SalesVelocityChartProps {
  velocityData: SalesVelocityData[];
  marketComparison?: MarketComparisonData;
  isLoading?: boolean;
}

export default function SalesVelocityChart({ velocityData, marketComparison, isLoading }: SalesVelocityChartProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vélocité des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Comparaison marché</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalNewListings = velocityData.reduce((sum, data) => sum + data.newListings, 0);
  const totalSold = velocityData.reduce((sum, data) => sum + data.soldProperties, 0);
  const overallTurnover = totalNewListings > 0 ? (totalSold / totalNewListings) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Graphique principal de vélocité */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Vélocité des ventes mensuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={velocityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                tickLine={false}
                fontSize={12}
              />
              <YAxis 
                yAxisId="count"
                orientation="left"
                stroke="#64748b" 
                tickLine={false}
                fontSize={11}
              />
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                stroke="#64748b" 
                tickLine={false}
                fontSize={11}
                tickFormatter={(value) => `${value}%`}
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
                              entry.dataKey === 'inventoryTurnover' 
                                ? `${(entry.value as number).toFixed(1)}%`
                                : entry.value
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
              
              {/* Barres pour nouvelles inscriptions */}
              <Bar 
                yAxisId="count"
                dataKey="newListings" 
                fill="#3b82f6" 
                name="Nouvelles inscriptions" 
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              
              {/* Barres pour propriétés vendues */}
              <Bar 
                yAxisId="count"
                dataKey="soldProperties" 
                fill="#10b981" 
                name="Propriétés vendues" 
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              
              {/* Ligne pour le taux de rotation d'inventaire */}
              <Line 
                yAxisId="percentage"
                type="monotone" 
                dataKey="inventoryTurnover" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Taux de rotation (%)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Métriques de comparaison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Performance vs Marché
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métriques globales */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Rotation d'inventaire</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {overallTurnover.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xs text-blue-600">Propriétés vendues / Nouvelles inscriptions</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Total vendu</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {totalSold}
                </Badge>
              </div>
              <p className="text-xs text-green-600">Cette année</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Nouvelles inscriptions</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {totalNewListings}
                </Badge>
              </div>
              <p className="text-xs text-purple-600">Cette année</p>
            </div>
          </div>

          {/* Comparaison avec le marché */}
          {marketComparison && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Comparaison marché</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Vitesse de vente</span>
                  <div className="flex items-center gap-1">
                    {marketComparison.agencyVelocity < marketComparison.marketVelocity ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Plus rapide</span>
                      </>
                    ) : marketComparison.agencyVelocity > marketComparison.marketVelocity ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Plus lent</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600 font-medium">≈ Marché</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Prix moyen</span>
                  <div className="flex items-center gap-1">
                    {marketComparison.relativePricing > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          +{marketComparison.relativePricing.toFixed(1)}%
                        </span>
                      </>
                    ) : marketComparison.relativePricing < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">
                          {marketComparison.relativePricing.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600 font-medium">≈ Marché</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Taux de commission</span>
                  <div className="flex items-center gap-1">
                    {marketComparison.agencyCommissionRate > marketComparison.marketCommissionRate ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Au-dessus</span>
                      </>
                    ) : marketComparison.agencyCommissionRate < marketComparison.marketCommissionRate ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">En-dessous</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600 font-medium">≈ Marché</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
