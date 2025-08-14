import { supabase } from '@/lib/supabase';
import { getPaymentFrequency, calculateNextDueDate, determinePaymentStatus } from '@/lib/utils';

/**
 * Synchronise automatiquement les paiements en retard pour un bail donné
 * Génère les paiements manquants basés sur la fréquence et les dates d'échéance
 */
export const syncOverduePayments = async (leaseId: string): Promise<{ data: number; error: string | null }> => {
  try {
    // Récupérer les informations du bail
    const { data: leaseData, error: leaseError } = await supabase
      .from('leases')
      .select('start_date, payment_start_date, payment_frequency, payment_day, monthly_rent, end_date')
      .eq('id', leaseId)
      .single();
      
    if (leaseError) {
      console.error('Erreur lors de la récupération du bail:', leaseError);
      return { data: 0, error: leaseError.message };
    }

    const {
      start_date,
      payment_start_date,
      payment_frequency,
      payment_day,
      monthly_rent,
      end_date
    } = leaseData as any;

    // Déterminer la date de début des paiements
    const effectiveStartDate: string | null = payment_start_date || start_date;
    
    if (!effectiveStartDate || !payment_frequency || !monthly_rent) {
      return { data: 0, error: 'Informations de bail insuffisantes pour générer les paiements' };
    }

    // Récupérer les paiements existants de type 'rent' pour ce bail
    const { data: existingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('due_date, status, payment_date')
      .eq('lease_id', leaseId)
      .eq('payment_type', 'rent')
      .order('due_date', { ascending: true });
      
    if (paymentsError) {
      console.error('Erreur lors de la récupération des paiements:', paymentsError);
      return { data: 0, error: paymentsError.message };
    }

    // Créer un Set des dates d'échéance existantes pour éviter les doublons
    const existingDueDates = new Set(
      (existingPayments || []).map((p: any) => p.due_date)
    );

    const payments: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Mettre à jour les paiements existants passés de "pending" à "late" (période de grâce de 5 jours)
    try {
      const graceDays = 5;
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - graceDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
      
      const { error: statusUpdateError } = await supabase
        .from('payments')
        .update({ status: 'late' })
        .eq('lease_id', leaseId)
        .eq('payment_type', 'rent')
        .eq('status', 'pending')
        .lt('due_date', cutoffDateStr);
      
      if (statusUpdateError) {
        console.error('Erreur mise à jour des paiements en retard:', statusUpdateError);
      }
    } catch (e) {
      console.error('Erreur inattendue lors de la mise à jour des statuts en retard:', e);
    }
    
    // Calculer la date de fin (soit end_date du bail, soit aujourd'hui)
    const endDateToUse = end_date ? new Date(end_date) : today;
    
    // Commencer par la date de début effective
    let currentDueDate = new Date(effectiveStartDate);
    let paymentNumber = 1;

    // Générer les paiements jusqu'à aujourd'hui (ou la fin du bail)
    while (currentDueDate <= today && currentDueDate <= endDateToUse) {
      const dueDateStr = currentDueDate.toISOString().split('T')[0];
      
      // Vérifier si un paiement existe déjà pour cette date
      if (!existingDueDates.has(dueDateStr)) {
        const dueDateObj = new Date(dueDateStr);
        dueDateObj.setHours(0, 0, 0, 0);
        
        // Déterminer un statut cohérent avec la logique globale (grace period de 5 jours)
        const effectiveStatus = determinePaymentStatus(dueDateStr, undefined, 5, today);
        // Si c'est dans le passé au-delà de la période de grâce => 'late', sinon 'pending'
        const status = effectiveStatus === 'late' ? 'late' : 'pending';
        
        payments.push({
          lease_id: leaseId,
          amount: monthly_rent,
          due_date: dueDateStr,
          payment_date: new Date().toISOString().split('T')[0], // Satisfait la contrainte NOT NULL
          payment_method: 'bank_transfer',
          status,
          payment_type: 'rent',
          is_auto_generated: true,
          notes: `Paiement automatique #${paymentNumber} - ${status === 'late' ? 'En retard' : 'À échoir'}`
        });
      }
      
      // Calculer la prochaine date d'échéance
      currentDueDate = calculateNextDueDate(
        currentDueDate.toISOString().split('T')[0],
        payment_frequency as string,
        payment_day as number | null,
        currentDueDate
      );
      
      paymentNumber++;
    }

    // Insérer les nouveaux paiements en base
    if (payments.length > 0) {
      const { error: insertError } = await supabase
        .from('payments')
        .insert(payments);
        
      if (insertError) {
        console.error('Erreur lors de l\'insertion des paiements:', insertError);
        return { data: 0, error: insertError.message };
      }
    }

    return { data: payments.length, error: null };
  } catch (error: any) {
    console.error('Erreur dans syncOverduePayments:', error);
    return { data: 0, error: error.message || 'Erreur inconnue lors de la synchronisation' };
  }
};

/**
 * Vérifie et synchronise les paiements en retard pour tous les baux actifs d'une agence
 */
export const syncOverduePaymentsForAgency = async (agencyId: string): Promise<{ totalSynced: number; error: string | null }> => {
  try {
    // Récupérer les baux actifs liés aux propriétés de l'agence
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select(`
        id,
        status,
        start_date,
        end_date,
        monthly_rent,
        payment_start_date,
        payment_frequency,
        payment_day,
        properties!inner(agency_id)
      `)
      .eq('properties.agency_id', agencyId)
      .eq('status', 'active');

    if (leasesError) {
      console.error('Erreur lors de la récupération des baux de l\'agence:', leasesError);
      return { totalSynced: 0, error: leasesError.message };
    }

    if (!leases || leases.length === 0) {
      return { totalSynced: 0, error: null };
    }

    // Lancer la synchronisation pour chaque bail trouvé
    const results = await Promise.all(
      leases.map(async (lease: any) => {
        const res = await syncOverduePayments(lease.id);
        return res.error ? 0 : res.data;
      })
    );

    const totalSynced = results.reduce((sum, n) => sum + (n || 0), 0);
    return { totalSynced, error: null };
  } catch (error: any) {
    console.error('Erreur dans syncOverduePaymentsForAgency:', error);
    return { totalSynced: 0, error: error.message || 'Erreur inconnue lors de la synchronisation de l\'agence' };
  }
};