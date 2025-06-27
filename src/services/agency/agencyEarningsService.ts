import { supabase } from '@/lib/supabase';

export interface AgencyEarning {
  id: string;
  amount: number;
  type: 'commission' | 'agency_fee';
  status: 'pending' | 'paid';
  rate?: number;
  baseAmount?: number;
  propertyTitle: string;
  propertyId: string;
  leaseId: string;
  paymentId: string;
  tenantName: string;
  createdAt: string;
  processedAt?: string;
}

export interface AgencyEarningsSummary {
  totalEarnings: number;
  commissionEarnings: number;
  agencyFeeEarnings: number;
  transactionCount: number;
  averageCommissionRate: number;
  paidEarnings: number;
  pendingEarnings: number;
}

export interface AgencyEarningsResponse {
  earnings: AgencyEarning[];
  summary: AgencyEarningsSummary;
}

export interface PropertyEarning {
  propertyId: string;
  propertyTitle: string;
  totalEarnings: number;
  commissionEarnings: number;
  agencyFeeEarnings: number;
  transactionCount: number;
  averageCommissionRate: number;
}

/**
 * Récupère les gains d'une agence pour une période donnée
 */
export const getAgencyEarnings = async (
  agencyId: string,
  period: 'month' | 'quarter' | 'year' = 'month',
  year: number = new Date().getFullYear()
): Promise<AgencyEarningsResponse> => {
  try {
    console.log(`🔍 Fetching earnings for agency ${agencyId}, period: ${period}, year: ${year}`);
    
    const { startDate, endDate } = getPeriodDates(period, year);
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // 1. Récupérer les commissions sur les loyers via la table commissions
    const { data: commissions, error: commissionError } = await supabase
      .from('commissions')
      .select(`
        id,
        amount,
        rate,
        status,
        created_at,
        processed_at,
        payment_id,
        lease_id,
        property_id,
        payments(
          id,
          amount,
          payment_type,
          payment_date,
          status
        ),
        properties(
          id,
          title,
          agency_id
        ),
        leases(
          id,
          tenants(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('properties.agency_id', agencyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (commissionError) {
      console.error('❌ Commission error:', commissionError);
      throw commissionError;
    }

    console.log(`💰 Found ${commissions?.length || 0} commissions`);

    // 2. Récupérer les frais d'agence (paiements de type agency_fee)
    const { data: agencyFees, error: agencyFeeError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_date,
        created_at,
        lease_id,
        payment_type,
        leases(
          id,
          property_id,
          tenants(
            first_name,
            last_name,
            email
          ),
          properties(
            id,
            title,
            agency_id,
            agency_fees
          )
        )
      `)
      .eq('payment_type', 'agency_fee')
      .eq('leases.properties.agency_id', agencyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (agencyFeeError) {
      console.error('❌ Agency fee error:', agencyFeeError);
      throw agencyFeeError;
    }

    console.log(`🏢 Found ${agencyFees?.length || 0} agency fees`);

    // 3. Transformer les commissions
    const commissionEarnings: AgencyEarning[] = (commissions || [])
      .filter(comm => comm.properties && comm.leases && comm.payments)
      .map(comm => ({
        id: `commission_${comm.id}`,
        amount: comm.amount || 0,
        type: 'commission' as const,
        status: comm.status as 'pending' | 'paid',
        rate: comm.rate || 0,
        baseAmount: comm.payments?.amount || 0,
        propertyTitle: comm.properties?.title || 'Propriété inconnue',
        propertyId: comm.property_id,
        leaseId: comm.lease_id,
        paymentId: comm.payment_id,
        tenantName: `${comm.leases?.tenants?.first_name || ''} ${comm.leases?.tenants?.last_name || ''}`.trim() || 'Locataire inconnu',
        createdAt: comm.created_at,
        processedAt: comm.processed_at
      }));

    // 4. Transformer les frais d'agence
    const agencyFeeEarnings: AgencyEarning[] = (agencyFees || [])
      .filter(fee => fee.leases?.properties)
      .map(fee => ({
        id: `agency_fee_${fee.id}`,
        amount: fee.amount || 0,
        type: 'agency_fee' as const,
        status: fee.status as 'pending' | 'paid',
        propertyTitle: fee.leases?.properties?.title || 'Propriété inconnue',
        propertyId: fee.leases?.properties?.id || '',
        leaseId: fee.lease_id,
        paymentId: fee.id,
        tenantName: `${fee.leases?.tenants?.first_name || ''} ${fee.leases?.tenants?.last_name || ''}`.trim() || 'Locataire inconnu',
        createdAt: fee.created_at,
        processedAt: fee.status === 'paid' ? fee.payment_date : undefined
      }));

    // 5. Combiner et trier tous les gains
    const allEarnings = [...commissionEarnings, ...agencyFeeEarnings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 6. Calculer le résumé détaillé
    const totalEarnings = allEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const commissionTotal = commissionEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const agencyFeeTotal = agencyFeeEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const paidEarnings = allEarnings.filter(e => e.status === 'paid').reduce((sum, earning) => sum + earning.amount, 0);
    const pendingEarnings = allEarnings.filter(e => e.status === 'pending').reduce((sum, earning) => sum + earning.amount, 0);

    const summary: AgencyEarningsSummary = {
      totalEarnings,
      commissionEarnings: commissionTotal,
      agencyFeeEarnings: agencyFeeTotal,
      transactionCount: allEarnings.length,
      averageCommissionRate: commissionEarnings.length > 0 
        ? commissionEarnings.reduce((sum, earning) => sum + (earning.rate || 0), 0) / commissionEarnings.length
        : 0,
      paidEarnings,
      pendingEarnings
    };

    console.log(`✅ Summary:`, summary);

    return {
      earnings: allEarnings,
      summary
    };

  } catch (error: any) {
    console.error('❌ Error fetching agency earnings:', error);
    throw new Error(`Erreur lors de la récupération des gains: ${error.message}`);
  }
};

/**
 * Récupérer les gains par propriété
 */
export const getEarningsByProperty = async (
  agencyId: string, 
  period: 'month' | 'quarter' | 'year' = 'month',
  year: number = new Date().getFullYear()
): Promise<PropertyEarning[]> => {
  try {
    const { startDate, endDate } = getPeriodDates(period, year);

    // Récupérer toutes les propriétés de l'agence avec leurs gains
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        commissions(
          amount,
          rate,
          status,
          created_at
        ),
        payments(
          amount,
          status,
          payment_type,
          created_at
        )
      `)
      .eq('agency_id', agencyId);

    if (error) throw error;

    const propertyEarnings: PropertyEarning[] = (properties || []).map(property => {
      // Filtrer les commissions dans la période
      const relevantCommissions = (property.commissions || []).filter(c => 
        new Date(c.created_at) >= startDate && new Date(c.created_at) <= endDate
      );

      // Filtrer les frais d'agence dans la période
      const relevantAgencyFees = (property.payments || []).filter(p => 
        p.payment_type === 'agency_fee' &&
        new Date(p.created_at) >= startDate && 
        new Date(p.created_at) <= endDate
      );

      const commissionTotal = relevantCommissions.reduce((sum, c) => sum + (c.amount || 0), 0);
      const agencyFeeTotal = relevantAgencyFees.reduce((sum, f) => sum + (f.amount || 0), 0);
      const totalEarnings = commissionTotal + agencyFeeTotal;
      const transactionCount = relevantCommissions.length + relevantAgencyFees.length;
      const averageCommissionRate = relevantCommissions.length > 0
        ? relevantCommissions.reduce((sum, c) => sum + (c.rate || 0), 0) / relevantCommissions.length
        : 0;

      return {
        propertyId: property.id,
        propertyTitle: property.title,
        totalEarnings,
        commissionEarnings: commissionTotal,
        agencyFeeEarnings: agencyFeeTotal,
        transactionCount,
        averageCommissionRate
      };
    }).filter(p => p.totalEarnings > 0); // Ne garder que les propriétés avec des gains

    return propertyEarnings.sort((a, b) => b.totalEarnings - a.totalEarnings);

  } catch (error: any) {
    console.error('Error fetching earnings by property:', error);
    throw new Error(`Erreur lors de la récupération des gains par propriété: ${error.message}`);
  }
};

/**
 * Obtenir les gains mensuels pour les graphiques
 */
export const getMonthlyEarnings = async (
  agencyId: string,
  year: number = new Date().getFullYear()
): Promise<{ month: string; commissions: number; agencyFees: number; total: number }[]> => {
  try {
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const { summary } = await getAgencyEarnings(agencyId, 'month', year);
      
      monthlyData.push({
        month: startDate.toLocaleDateString('fr-FR', { month: 'short' }),
        commissions: summary.commissionEarnings,
        agencyFees: summary.agencyFeeEarnings,
        total: summary.totalEarnings
      });
    }

    return monthlyData;
  } catch (error: any) {
    console.error('Error fetching monthly earnings:', error);
    throw new Error(`Erreur lors de la récupération des gains mensuels: ${error.message}`);
  }
};

/**
 * Obtenir les dates de début et fin pour une période donnée
 */
function getPeriodDates(period: 'month' | 'quarter' | 'year', year: number) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'month':
      startDate = new Date(year, now.getMonth(), 1);
      endDate = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);
      break;
    
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(year, quarter * 3, 1);
      endDate = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59);
      break;
    
    case 'year':
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
      break;
  }

  return { startDate, endDate };
}
