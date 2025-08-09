import { supabase } from '@/lib/supabase';

/**
 * Terminate (resiliate) a lease – set status to 'terminated', mark inactive, but keep historical payments.
 * Optionally updates the related property to 'available'.
 */
export const terminateLease = async (leaseId: string, details?: any) => {
  try {
    const { data: leaseData, error: updateError } = await supabase
      .from('leases')
      .update({
        status: 'terminated',
        is_active: false,
        termination_date: new Date().toISOString(),
        termination_notes: details ? JSON.stringify(details) : null,
      })
      .eq('id', leaseId)
      .select('property_id')
      .single();

    if (updateError) throw updateError;

    if (leaseData?.property_id) {
      await supabase
        .from('properties')
        .update({ status: 'available' })
        .eq('id', leaseData.property_id);
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error terminating lease', err);
    return { success: false, error: err.message };
  }
}; 