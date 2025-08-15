import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Building
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getPropertySales, PropertySale } from '@/services/sales/propertySalesService';
import { getProperties } from '@/services/propertyService';
import { Property } from '@/assets/types';
import { SaleStatusBadge } from '@/utils/saleStatusUtils';
import { debugSalesTable } from '@/utils/salesDebug';

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  avgSalePrice: number;
  activeSales: number;
  completedSales: number;
}

export default function PropertySalesPage() {
  const { agencyId, propertyId } = useParams();
  const [sales, setSales] = useState<PropertySale[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalCommission: 0,
    avgSalePrice: 0,
    activeSales: 0,
    completedSales: 0
  });

  const calculateStats = (salesData: PropertySale[]) => {
    const completedSales = salesData.filter(s => s.status === 'closed');
    const activeSales = salesData.filter(s => s.status === 'pending');
    
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalCommission = completedSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
    const avgSalePrice = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

    setStats({
      totalSales: salesData.length,
      totalRevenue,
      totalCommission,
      avgSalePrice,
      activeSales: activeSales.length,
      completedSales: completedSales.length
    });
  };

  const loadData = async () => {
    if (!propertyId || !agencyId) return;
    setLoading(true);
    
    try {
      console.log('🏠 Loading data for property:', propertyId, 'in agency:', agencyId);
      
      // Debug the sales table first
      await debugSalesTable();
      
      const [salesResult, propertiesResult] = await Promise.all([
        getPropertySales(propertyId),
        getProperties(agencyId)
      ]);

      console.log('📈 Sales result received:', salesResult);
      setSales(salesResult.sales);
      
      // Find the specific property
      const foundProperty = propertiesResult.properties.find(p => p.id === propertyId);
      setProperty(foundProperty || null);
      

      
      calculateStats(salesResult.sales);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [propertyId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement des données de vente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/agencies/${agencyId}/properties/${propertyId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la propriété
          </Link>
        </div>
      </div>

      {/* Property Header */}
      {property && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{property.title}</h1>
                  <p className="text-muted-foreground">{property.location}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-lg font-semibold">{formatCurrency(property.price || 0)}</span>
                    <SaleStatusBadge status={property.status || 'available'} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ventes</p>
                <p className="text-2xl font-bold">{stats.totalSales}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissions</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCommission)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prix moyen</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgSalePrice)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Historique des ventes</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {stats.completedSales} complétées
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                {stats.activeSales} en cours
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune vente enregistrée</h3>
              <p className="text-muted-foreground mb-4">
                {property?.status === 'sold' 
                  ? "Cette propriété est marquée comme vendue mais aucun enregistrement de vente n'a été trouvé."
                  : "Les ventes de cette propriété apparaîtront ici une fois enregistrées."
                }
              </p>
              {property?.status === 'sold' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-yellow-800 mb-3">
                    💡 <strong>Suggestion :</strong> Créez un enregistrement de vente pour cette propriété vendue afin de compléter l'historique.
                  </p>
                  <Button 
                    onClick={() => {
                      // Aller vers la propriété pour utiliser "Confirmer la vente"
                      window.location.href = `/agencies/${agencyId}/properties/${propertyId}`;
                    }}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Enregistrer la vente
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{formatCurrency(sale.sale_price)}</span>
                          <SaleStatusBadge status={sale.status || 'pending'} size="sm" />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                          </span>
                          {sale.buyer_name && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {sale.buyer_name}
                            </span>
                          )}
                          {sale.commission_amount && (
                            <span className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Commission: {formatCurrency(sale.commission_amount)}
                            </span>
                          )}
                        </div>
                        {sale.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{sale.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


