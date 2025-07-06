import { supabase } from '@/lib/supabase';
import { BulkUpdateParams } from './types';
import { createCommissionForPayment } from './paymentCore';

export const updateBulkPayments = async ({ paymentIds, status, notes, userId }: BulkUpdateParams): Promise<{ success: boolean; error: string | null }> => {
  try {
    if (!paymentIds.length) {
      return { success: false, error: "Aucun paiement sélectionné" };
    }
    
    // Start a Supabase transaction by creating a bulk update record first
    const { data: bulkUpdateData, error: bulkUpdateError } = await supabase
      .from('payment_bulk_updates')
      .insert({
        user_id: userId,
        payments_count: paymentIds.length,
        status,
        notes
      })
      .select()
      .single();
      
    if (bulkUpdateError) return { success: false, error: bulkUpdateError.message };
    
    // Get previous status of each payment before updating
    const { data: previousStatusData, error: previousStatusError } = await supabase
      .from('payments')
      .select('id, status')
      .in('id', paymentIds);
      
    if (previousStatusError) return { success: false, error: previousStatusError.message };
    
    // Create a map of payment ID to previous status
    const previousStatusMap = previousStatusData.reduce((acc, curr) => {
      acc[curr.id] = curr.status;
      return acc;
    }, {} as Record<string, string>);
    
    // Update all payments and get updated rows
    const { data: updatedPayments, error: updateError } = await supabase
      .from('payments')
      .update({ 
        status, 
        notes: notes ? notes : undefined,
        processed_by: userId ? userId : undefined
      })
      .in('id', paymentIds)
      .select();
      
    if (updateError) return { success: false, error: updateError.message };
    
    // Créer d'éventuelles commissions sur les loyers maintenant payés
    if (updatedPayments) {
      for (const p of updatedPayments) {
        await createCommissionForPayment(p);
      }
    }
    
    // Create bulk update items for tracking
    const bulkUpdateItems = paymentIds.map(paymentId => ({
      bulk_update_id: bulkUpdateData.id,
      payment_id: paymentId,
      previous_status: previousStatusMap[paymentId] || null,
      new_status: status
    }));
    
    const { error: itemsError } = await supabase
      .from('payment_bulk_update_items')
      .insert(bulkUpdateItems);
      
    if (itemsError) {
      console.error('Error creating bulk update items:', itemsError);
      // We don't return an error here as the payments were already updated
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in bulk update:', error);
    return { success: false, error: error.message || "Une erreur est survenue lors de la mise à jour en masse" };
  }
};
