import { supabase } from '@/lib/supabase';
import { PropertySale } from './propertySalesService';

export interface AgencySalesStats {
  totalForSale: number;
  totalValue: number;
  averagePrice: number;
  pendingSales: number;
  completedSales: number;
  cancelledSales: number;
  totalRevenue: number;
  totalCommissions: number;
  averageCommissionRate: number;
  averageDaysOnMarket: number;
  conversionRate: number;
}

export interface SalesPerformanceMetrics {
  monthlyData: MonthlyPeriod[];
  quarterlyData: QuarterlyPeriod[];
  yearlyData: YearlyPeriod[];
  priceDistribution: PriceRange[];
  salesVelocity: SalesVelocityData[];
  marketComparison: MarketComparisonData;
}

export interface MonthlyPeriod {
  period: string; // 'YYYY-MM'
  month: string; // 'Janvier', 'Février', etc.
  sales: number;
  revenue: number;
  commissions: number;
  averagePrice: number;
  averageDaysOnMarket: number;
  conversionRate: number;
}

export interface QuarterlyPeriod {
  period: string; // 'Q1 2024'
  quarter: string;
  year: number;
  sales: number;
  revenue: number;
  commissions: number;
  averagePrice: number;
  growth: number; // Pourcentage vs période précédente
}

export interface YearlyPeriod {
  year: number;
  sales: number;
  revenue: number;
  commissions: number;
  averagePrice: number;
  growth: number;
}

export interface PriceRange {
  range: string; // '0-10M', '10M-25M', etc.
  count: number;
  percentage: number;
  averageTime: number; // jours moyens pour vendre
}

export interface SalesVelocityData {
  month: string;
  newListings: number;
  soldProperties: number;
  inventoryTurnover: number;
}

export interface MarketComparisonData {
  agencyAveragePrice: number;
  marketAveragePrice: number;
  agencyVelocity: number;
  marketVelocity: number;
  agencyCommissionRate: number;
  marketCommissionRate: number;
  relativePricing: number; // Pourcentage vs marché
}

export interface PropertyMarketingData {
  id: string;
  title: string;
  price: number;
  listedDate: string;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
  daysOnMarket: number;
  viewCount: number;
  inquiries: number;
  price_changes: PriceChange[];
  lastActivity: string;
}

export interface PriceChange {
  date: string;
  oldPrice: number;
  newPrice: number;
  reason?: string;
}

/**
 * Récupère les statistiques de vente principales pour une agence
 */
export async function getAgencySalesStats(agencyId: string): Promise<AgencySalesStats> {
  try {
    // Récupérer toutes les propriétés de l'agence avec leurs ventes
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        price,
        type,
        created_at,
        status,
        features,
        property_sales (
          id,
          sale_price,
          sale_date,
          commission_amount,
          commission_rate,
          status,
          created_at
        )
      `)
      .eq('agency_id', agencyId);

    if (propertiesError) throw propertiesError;

    // Propriétés en vente actives
    const activeForSale = (properties || []).filter(p => {
      const isForSale = (p.features || []).includes('for_sale');
      return isForSale && p.status === 'available';
    });

    // Toutes les ventes (incluant celles des propriétés qui ne sont plus en vente)
    const allSales = (properties || []).flatMap(p => p.property_sales || []);
    
    const completedSales = allSales.filter(s => s.status === 'completed');
    const pendingSales = allSales.filter(s => s.status === 'pending');
    const cancelledSales = allSales.filter(s => s.status === 'cancelled');

    const totalValue = activeForSale.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalRevenue = completedSales.reduce((sum, s) => sum + s.sale_price, 0);
    const totalCommissions = completedSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);

    // Calcul du taux de commission moyen
    const totalCommissionRate = completedSales.reduce((sum, s) => sum + (s.commission_rate || 0), 0);
    const averageCommissionRate = completedSales.length > 0 ? totalCommissionRate / completedSales.length : 0;

    // Calcul des jours moyens sur le marché
    const daysOnMarketData = completedSales.map(sale => {
      const saleDate = new Date(sale.sale_date);
      const listingDate = new Date(sale.created_at);
      return Math.floor((saleDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageDaysOnMarket = daysOnMarketData.length > 0 
      ? daysOnMarketData.reduce((sum, days) => sum + days, 0) / daysOnMarketData.length 
      : 0;

    // Taux de conversion (ventes complétées / total des propriétés listées)
    const totalListedProperties = (properties || []).filter(p => {
      const isForSale = (p.features || []).includes('for_sale');
      return isForSale;
    }).length;
    
    const conversionRate = totalListedProperties > 0 ? (completedSales.length / totalListedProperties) * 100 : 0;

    return {
      totalForSale: activeForSale.length,
      totalValue,
      averagePrice: activeForSale.length > 0 ? totalValue / activeForSale.length : 0,
      pendingSales: pendingSales.length,
      completedSales: completedSales.length,
      cancelledSales: cancelledSales.length,
      totalRevenue,
      totalCommissions,
      averageCommissionRate,
      averageDaysOnMarket,
      conversionRate
    };
  } catch (error) {
    console.error('Error fetching agency sales stats:', error);
    throw error;
  }
}

/**
 * Récupère les données de performance des ventes par période
 */
export async function getSalesPerformanceMetrics(agencyId: string, year: number = new Date().getFullYear()): Promise<SalesPerformanceMetrics> {
  try {
    // Récupérer les ventes de l'année avec les détails des propriétés
    const { data: salesData, error } = await supabase
      .from('property_sales')
      .select(`
        *,
        properties!inner (
          id,
          agency_id,
          price,
          created_at,
          type,
          features
        )
      `)
      .eq('properties.agency_id', agencyId)
      .gte('sale_date', `${year}-01-01`)
      .lte('sale_date', `${year}-12-31`)
      .eq('status', 'completed')
      .order('sale_date', { ascending: true });

    if (error) throw error;

    const sales = salesData || [];

    // Générer les données mensuelles
    const monthlyData = generateMonthlyData(sales, year);
    
    // Générer les données trimestrielles
    const quarterlyData = generateQuarterlyData(monthlyData, year);
    
    // Données annuelles (historique des dernières années)
    const yearlyData = await getYearlyData(agencyId, year);
    
    // Distribution des prix
    const priceDistribution = generatePriceDistribution(sales);
    
    // Vélocité des ventes
    const salesVelocity = await generateSalesVelocity(agencyId, year);
    
    // Comparaison avec le marché
    const marketComparison = await generateMarketComparison(agencyId, sales);

    return {
      monthlyData,
      quarterlyData,
      yearlyData,
      priceDistribution,
      salesVelocity,
      marketComparison
    };
  } catch (error) {
    console.error('Error fetching sales performance metrics:', error);
    throw error;
  }
}

/**
 * Récupère les données de marketing des propriétés
 */
export async function getPropertyMarketingData(agencyId: string): Promise<PropertyMarketingData[]> {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        created_at,
        status,
        type,
        features
      `)
      .eq('agency_id', agencyId)
      .contains('features', ['for_sale']);

    if (error) throw error;

    return (properties || []).map(property => {
      const daysOnMarket = Math.floor(
        (new Date().getTime() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: property.id,
        title: property.title || 'Sans titre',
        price: property.price || 0,
        listedDate: property.created_at,
        status: property.status,
        daysOnMarket,
        viewCount: 0, // À implémenter avec un système de tracking
        inquiries: 0, // À implémenter avec une table d'inquiries
        price_changes: [], // À implémenter avec une table de changements de prix
        lastActivity: property.created_at // À améliorer avec les vraies données d'activité
      };
    });
  } catch (error) {
    console.error('Error fetching property marketing data:', error);
    throw error;
  }
}

// Fonctions utilitaires

function generateMonthlyData(sales: any[], year: number): MonthlyPeriod[] {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return months.map((month, index) => {
    const monthIndex = index + 1;
    const period = `${year}-${monthIndex.toString().padStart(2, '0')}`;
    
    const monthSales = sales.filter(sale => {
      const saleMonth = new Date(sale.sale_date).getMonth() + 1;
      return saleMonth === monthIndex;
    });

    const revenue = monthSales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const commissions = monthSales.reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
    const averagePrice = monthSales.length > 0 ? revenue / monthSales.length : 0;

    // Calcul approximatif des jours sur le marché
    const daysOnMarket = monthSales.map(sale => {
      const saleDate = new Date(sale.sale_date);
      const listingDate = new Date(sale.properties.created_at);
      return Math.floor((saleDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageDaysOnMarket = daysOnMarket.length > 0 
      ? daysOnMarket.reduce((sum, days) => sum + days, 0) / daysOnMarket.length 
      : 0;

    return {
      period,
      month,
      sales: monthSales.length,
      revenue,
      commissions,
      averagePrice,
      averageDaysOnMarket,
      conversionRate: 0 // À calculer avec plus de données
    };
  });
}

function generateQuarterlyData(monthlyData: MonthlyPeriod[], year: number): QuarterlyPeriod[] {
  const quarters = [
    { quarter: 'Q1', months: [0, 1, 2] },
    { quarter: 'Q2', months: [3, 4, 5] },
    { quarter: 'Q3', months: [6, 7, 8] },
    { quarter: 'Q4', months: [9, 10, 11] }
  ];

  return quarters.map(({ quarter, months }) => {
    const quarterMonths = months.map(i => monthlyData[i]);
    const sales = quarterMonths.reduce((sum, month) => sum + month.sales, 0);
    const revenue = quarterMonths.reduce((sum, month) => sum + month.revenue, 0);
    const commissions = quarterMonths.reduce((sum, month) => sum + month.commissions, 0);
    const averagePrice = sales > 0 ? revenue / sales : 0;

    return {
      period: `${quarter} ${year}`,
      quarter,
      year,
      sales,
      revenue,
      commissions,
      averagePrice,
      growth: 0 // À calculer avec les données de l'année précédente
    };
  });
}

async function getYearlyData(agencyId: string, currentYear: number): Promise<YearlyPeriod[]> {
  const years = [currentYear - 2, currentYear - 1, currentYear];
  const yearlyData: YearlyPeriod[] = [];

  for (const year of years) {
    try {
      const { data: sales, error } = await supabase
        .from('property_sales')
        .select(`
          sale_price,
          commission_amount,
          properties!inner (agency_id)
        `)
        .eq('properties.agency_id', agencyId)
        .gte('sale_date', `${year}-01-01`)
        .lte('sale_date', `${year}-12-31`)
        .eq('status', 'completed');

      if (error) throw error;

      const revenue = (sales || []).reduce((sum, sale) => sum + sale.sale_price, 0);
      const commissions = (sales || []).reduce((sum, sale) => sum + (sale.commission_amount || 0), 0);
      const salesCount = (sales || []).length;
      const averagePrice = salesCount > 0 ? revenue / salesCount : 0;

      // Calcul de la croissance par rapport à l'année précédente
      const previousYearData = yearlyData.find(d => d.year === year - 1);
      const growth = previousYearData && previousYearData.revenue > 0 
        ? ((revenue - previousYearData.revenue) / previousYearData.revenue) * 100 
        : 0;

      yearlyData.push({
        year,
        sales: salesCount,
        revenue,
        commissions,
        averagePrice,
        growth
      });
    } catch (error) {
      console.error(`Error fetching yearly data for ${year}:`, error);
    }
  }

  return yearlyData;
}

function generatePriceDistribution(sales: any[]): PriceRange[] {
  const ranges = [
    { min: 0, max: 10000000, label: '0-10M' },
    { min: 10000000, max: 25000000, label: '10M-25M' },
    { min: 25000000, max: 50000000, label: '25M-50M' },
    { min: 50000000, max: 100000000, label: '50M-100M' },
    { min: 100000000, max: Infinity, label: '100M+' }
  ];

  const total = sales.length;

  return ranges.map(range => {
    const salesInRange = sales.filter(sale => 
      sale.sale_price >= range.min && sale.sale_price < range.max
    );

    const averageTime = salesInRange.length > 0 
      ? salesInRange.reduce((sum, sale) => {
          const days = Math.floor(
            (new Date(sale.sale_date).getTime() - new Date(sale.properties.created_at).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / salesInRange.length
      : 0;

    return {
      range: range.label,
      count: salesInRange.length,
      percentage: total > 0 ? (salesInRange.length / total) * 100 : 0,
      averageTime
    };
  });
}

async function generateSalesVelocity(agencyId: string, year: number): Promise<SalesVelocityData[]> {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  const velocityData: SalesVelocityData[] = [];

  for (let month = 0; month < 12; month++) {
    const monthStart = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    const monthEnd = `${year}-${(month + 1).toString().padStart(2, '0')}-31`;

    try {
      // Nouvelles inscriptions
      const { data: newListings } = await supabase
        .from('properties')
        .select('id')
        .eq('agency_id', agencyId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .contains('features', ['for_sale']);

      // Propriétés vendues
      const { data: soldProperties } = await supabase
        .from('property_sales')
        .select(`
          id,
          properties!inner (agency_id)
        `)
        .eq('properties.agency_id', agencyId)
        .gte('sale_date', monthStart)
        .lte('sale_date', monthEnd)
        .eq('status', 'completed');

      const newListingsCount = (newListings || []).length;
      const soldCount = (soldProperties || []).length;
      const inventoryTurnover = newListingsCount > 0 ? (soldCount / newListingsCount) * 100 : 0;

      velocityData.push({
        month: months[month],
        newListings: newListingsCount,
        soldProperties: soldCount,
        inventoryTurnover
      });
    } catch (error) {
      console.error(`Error generating sales velocity for month ${month + 1}:`, error);
      velocityData.push({
        month: months[month],
        newListings: 0,
        soldProperties: 0,
        inventoryTurnover: 0
      });
    }
  }

  return velocityData;
}

async function generateMarketComparison(agencyId: string, agencySales: any[]): Promise<MarketComparisonData> {
  try {
    // Récupérer les données du marché (toutes les agences)
    const { data: marketSales, error } = await supabase
      .from('property_sales')
      .select(`
        sale_price,
        commission_rate,
        sale_date,
        properties!inner (created_at)
      `)
      .eq('status', 'completed')
      .gte('sale_date', `${new Date().getFullYear()}-01-01`);

    if (error) throw error;

    // Calculs pour l'agence
    const agencyRevenue = agencySales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const agencyAveragePrice = agencySales.length > 0 ? agencyRevenue / agencySales.length : 0;
    const agencyCommissionRate = agencySales.length > 0 
      ? agencySales.reduce((sum, sale) => sum + (sale.commission_rate || 0), 0) / agencySales.length 
      : 0;

    // Calcul de la vélocité de l'agence (jours moyens)
    const agencyDaysOnMarket = agencySales.map(sale => {
      const saleDate = new Date(sale.sale_date);
      const listingDate = new Date(sale.properties.created_at);
      return Math.floor((saleDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24));
    });
    const agencyVelocity = agencyDaysOnMarket.length > 0 
      ? agencyDaysOnMarket.reduce((sum, days) => sum + days, 0) / agencyDaysOnMarket.length 
      : 0;

    // Calculs pour le marché
    const marketRevenue = (marketSales || []).reduce((sum: number, sale: any) => sum + sale.sale_price, 0);
    const marketAveragePrice = (marketSales || []).length > 0 ? marketRevenue / (marketSales || []).length : 0;
    const marketCommissionRate = (marketSales || []).length > 0 
      ? (marketSales || []).reduce((sum: number, sale: any) => sum + (sale.commission_rate || 0), 0) / (marketSales || []).length 
      : 0;

    // Calcul de la vélocité du marché
    const marketDaysOnMarket = (marketSales || []).map((sale: any) => {
      const saleDate = new Date(sale.sale_date);
      const listingDate = new Date(sale.properties.created_at);
      return Math.floor((saleDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24));
    });
    const marketVelocity = marketDaysOnMarket.length > 0 
      ? marketDaysOnMarket.reduce((sum: number, days: number) => sum + days, 0) / marketDaysOnMarket.length 
      : 0;

    // Calcul du positionnement relatif
    const relativePricing = marketAveragePrice > 0 ? ((agencyAveragePrice - marketAveragePrice) / marketAveragePrice) * 100 : 0;

    return {
      agencyAveragePrice,
      marketAveragePrice,
      agencyVelocity,
      marketVelocity,
      agencyCommissionRate,
      marketCommissionRate,
      relativePricing
    };
  } catch (error) {
    console.error('Error generating market comparison:', error);
    return {
      agencyAveragePrice: 0,
      marketAveragePrice: 0,
      agencyVelocity: 0,
      marketVelocity: 0,
      agencyCommissionRate: 0,
      marketCommissionRate: 0,
      relativePricing: 0
    };
  }
}
