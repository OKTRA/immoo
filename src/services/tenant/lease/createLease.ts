import { supabase } from '@/lib/supabase';
import { ApartmentLease } from '@/assets/types';
import { createInitialPayments } from './paymentUtils';
import { checkUserResourceLimit } from '@/services/subscription/limit';

/**
 * Create a new lease
 */
export const createLease = async (leaseData: Omit<ApartmentLease, 'id'>) => {
  try {
    console.log('Creating lease with data:', leaseData);
    
    // CORRECTION: Vérifier les limites avant de créer un bail
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (userId) {
      const limit = await checkUserResourceLimit(userId, 'leases');
      if (!limit.allowed) {
        throw new Error(`Limite de ${limit.maxAllowed} baux atteinte avec votre abonnement actuel. Veuillez mettre à niveau votre abonnement.`);
      }
    }
    
    // First check if the property is available
    const { data: propertyData, error: propertyCheckError } = await supabase
      .from('properties')
      .select('status, agency_fees')
      .eq('id', leaseData.propertyId)
      .single();
    
    if (propertyCheckError) {
      console.error('Error checking property status:', propertyCheckError);
      throw propertyCheckError;
    }
    
    if (propertyData && propertyData.status !== 'available') {
      throw new Error(`Cannot create lease: Property is not available (current status: ${propertyData.status})`);
    }
    
    // Convert data to match the actual database column names in the leases table
    const dataToInsert = {
      property_id: leaseData.propertyId,
      tenant_id: leaseData.tenantId,
      start_date: leaseData.startDate,
      end_date: leaseData.endDate,
      payment_start_date: leaseData.paymentStartDate, 
      monthly_rent: leaseData.monthly_rent,
      security_deposit: leaseData.security_deposit,
      payment_day: leaseData.payment_day,
      payment_frequency: leaseData.payment_frequency,
      is_active: true, // Always set to true as per the updated function
      signed_by_tenant: true, // Always set to true as per the updated function
      signed_by_owner: true, // Always set to true as per the updated function
      has_renewal_option: leaseData.has_renewal_option,
      lease_type: leaseData.lease_type,
      special_conditions: leaseData.special_conditions,
      status: 'active' // Always set to 'active' as per the updated function
    };

    console.log('Data to insert:', dataToInsert);

    // Use RPC to create lease, property update, and initial payments in a transaction
    const { data: lease, error } = await supabase.rpc('create_lease_with_payments', { 
      lease_data: dataToInsert,
      property_id: leaseData.propertyId,
      new_property_status: 'rented', // Changed from 'occupied' to 'rented'
      agency_fees: propertyData.agency_fees || 0
    });

    if (error) {
      console.error('Supabase error creating lease:', error);
      
      // Fallback to regular insert if the RPC doesn't exist OR if it fails due to NOT NULL/tenant issues
      const shouldFallback =
        error.message?.includes('does not exist') ||
        error.code === '23502' ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('tenant_id'));

      if (shouldFallback) {
        console.log('Fallback to non-transactional operation');
        
        // Insert the lease with active status
        const leaseToInsert = {
          ...dataToInsert,
          is_active: true,
          signed_by_tenant: true,
          signed_by_owner: true,
          status: 'active'
        };
        
        const { data, error: insertError } = await supabase
          .from('leases')
          .insert([leaseToInsert])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating lease:', insertError);
          throw insertError;
        }
        
        // Create initial payments manually using the lease start date
        await createInitialPayments(
          data.id, 
          leaseData.security_deposit || 0, 
          propertyData.agency_fees || 0,
          true, // Mark as paid
          data.start_date // Use lease start date
        );
        
        // Update the property status to rented
        const { error: updateError } = await supabase
          .from('properties')
          .update({ status: 'rented' })
          .eq('id', leaseData.propertyId);
          
        if (updateError) {
          console.error('Error updating property status:', updateError);
          // Continue anyway, we successfully created the lease
        }
        
        return { lease: data, error: null };
      }
      
      throw error;
    }
    return { lease, error: null };
  } catch (error: any) {
    console.error('Error creating lease:', error);
    return { lease: null, error: error.message };
  }
};
