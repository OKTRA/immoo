import { getPaymentsByLeaseId } from './paymentCore';
import { supabase } from '@/lib/supabase';
import { determinePaymentStatus } from '@/lib/utils';

export const getLeasePaymentStats = async (leaseId: string) => {
  try {
    const { data: payments, error } = await getPaymentsByLeaseId(leaseId);
    
    if (error) return { stats: null, error };
    
    const stats = {
      totalPaid: 0,
      totalDue: 0,
      pendingPayments: 0,
      latePayments: 0,
      advancedPayments: 0,
      undefinedPayments: 0,
      balance: 0
    };
    
    if (payments) {
      payments.forEach(payment => {
        // Add to total due
        stats.totalDue += payment.amount;
        
        // Déterminer le statut effectif
        // On privilégie la colonne `status` (renseignée côté application) pour éviter
        // de fausser les résultats à cause d'un `payment_date` artificiel.
        const effectiveStatus = payment.status || determinePaymentStatus(
          payment.dueDate,
          payment.paymentDate,
          5 // 5-day grace period
        );
        
        // Calculate based on determined status
        if (effectiveStatus === 'paid') {
          stats.totalPaid += payment.amount;
        } else if (effectiveStatus === 'pending') {
          stats.pendingPayments++;
        } else if (effectiveStatus === 'late') {
          stats.latePayments++;
        } else if (effectiveStatus === 'advanced') {
          stats.advancedPayments++;
          stats.totalPaid += payment.amount; // It's still paid
        } else if (effectiveStatus === 'undefined') {
          stats.undefinedPayments++;
        }
      });
      
      // Calculate balance
      stats.balance = stats.totalDue - stats.totalPaid;
    }
    
    return { stats, error: null };
  } catch (error: any) {
    console.error('Error calculating lease payment stats:', error);
    return { stats: null, error: error.message || 'An unknown error occurred' };
  }
};

export const getPaymentTotalsByType = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('payment_type, amount, status')
      .eq('lease_id', leaseId);
      
    if (error) return { totals: null, error: error.message };
    
    const totals = {
      deposit: {
        total: 0,
        paid: 0,
        pending: 0
      },
      agency_fee: {
        total: 0,
        paid: 0,
        pending: 0
      },
      rent: {
        total: 0,
        paid: 0,
        pending: 0
      },
      other: {
        total: 0,
        paid: 0,
        pending: 0
      }
    };
    
    data.forEach(payment => {
      const type = payment.payment_type || 'other';
      const amount = payment.amount || 0;
      
      // Add to total for this payment type
      if (totals[type]) {
        totals[type].total += amount;
        
        // Add to paid or pending based on status
        if (payment.status === 'paid' || payment.status === 'advanced') {
          totals[type].paid += amount;
        } else if (payment.status === 'pending' || payment.status === 'undefined') {
          totals[type].pending += amount;
        }
      } else {
        totals.other.total += amount;
        if (payment.status === 'paid' || payment.status === 'advanced') {
          totals.other.paid += amount;
        } else if (payment.status === 'pending' || payment.status === 'undefined') {
          totals.other.pending += amount;
        }
      }
    });
    
    return { totals, error: null };
  } catch (error: any) {
    console.error('Error calculating payment totals by type:', error);
    return { totals: null, error: error.message };
  }
};
