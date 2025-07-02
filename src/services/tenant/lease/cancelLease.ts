import { supabase } from '@/lib/supabase';

/**
 * Cancel a lease: set status to 'terminated', mark inactive, remove auto-generated payments.
 */
export const cancelLease = async (leaseId: string) => {
  try {
    // 1) Mark lease as terminated / inactive
    const { data: leaseData, error: updateError } = await supabase
      .from('leases')
      .update({ status: 'cancelled', is_active: false })
      .eq('id', leaseId)
      .select('property_id')
      .single();

    if (updateError) throw updateError;

    // 2) Delete payments auto-generated for this lease (deposit, agency_fee)
    const { error: deletePaymentsError } = await supabase
      .from('payments')
      .delete()
      .eq('lease_id', leaseId)
      .eq('is_auto_generated', true);

    if (deletePaymentsError) throw deletePaymentsError;

    // 3) Set related property back to available (optional)
    if (leaseData?.property_id) {
      await supabase
        .from('properties')
        .update({ status: 'available' })
        .eq('id', leaseData.property_id);
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error cancelling lease', err);
    return { success: false, error: err.message };
  }
}; 