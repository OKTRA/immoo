
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PaymentData, getLeaseWithPayments, getLeasePaymentStats, createPayment, updatePayment, deletePayment } from "@/services/payment";
import { syncOverduePayments } from "@/services/payment/paymentAutoSync";

export const useLeasePayments = (leaseId: string | undefined) => {
  const { toast } = useToast();
  
  const [lease, setLease] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    pendingPayments: 0,
    latePayments: 0,
    advancedPayments: 0,
    undefinedPayments: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  const fetchData = async () => {
    if (!leaseId) return;
    
    setLoading(true);
    try {
      // 1) Synchroniser automatiquement les paiements manquants/en retard
      const syncResult = await syncOverduePayments(leaseId);
      if (syncResult.error) {
        console.warn("Sync paiements en retard a échoué:", syncResult.error);
      } else if (syncResult.data > 0) {
        toast({
          title: "Paiements synchronisés",
          description: `${syncResult.data} ligne(s) de paiement ont été ajoutées automatiquement.`
        });
      }

      // 2) Récupérer les données du bail et les paiements
      const { lease: leaseData, payments: paymentsData, error } = await getLeaseWithPayments(leaseId);
      if (error) throw new Error(error);
      
      setLease(leaseData);
      setPayments(paymentsData || []);
      
      // 3) Récupérer les statistiques
      const { stats: paymentStats, error: statsError } = await getLeasePaymentStats(leaseId);
      if (statsError) throw new Error(statsError);
      
      setStats(paymentStats);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de récupérer les données: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leaseId]);
  
  const handleAddPayment = async (data: PaymentData) => {
    setSubmitting(true);
    try {
      // Create new payment
      const result = await createPayment({
        ...data,
        leaseId: leaseId!
      });
      if (result.error) throw new Error(result.error);
      
      toast({
        title: "Paiement ajouté",
        description: "Le paiement a été ajouté avec succès."
      });
      
      // Refresh data
      fetchData();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter le paiement: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePayment = async (paymentId: string, data: PaymentData) => {
    setSubmitting(true);
    try {
      // Update existing payment
      const result = await updatePayment(paymentId, data);
      if (result.error) throw new Error(result.error);
      
      toast({
        title: "Paiement mis à jour",
        description: "Le paiement a été mis à jour avec succès."
      });
      
      // Refresh data
      fetchData();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le paiement: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce paiement?")) return false;
    
    try {
      const { success, error } = await deletePayment(paymentId);
      if (error) throw new Error(error);
      
      toast({
        title: "Paiement supprimé",
        description: "Le paiement a été supprimé avec succès."
      });
      
      // Refresh data
      fetchData();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le paiement: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const handlePaymentSelect = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPaymentIds(prev => [...prev, paymentId]);
    } else {
      setSelectedPaymentIds(prev => prev.filter(id => id !== paymentId));
    }
  };
  
  const clearSelectedPayments = () => {
    setSelectedPaymentIds([]);
  };
  
  return {
    lease,
    payments,
    stats,
    loading,
    submitting,
    selectedPaymentIds,
    fetchData,
    handleAddPayment,
    handleUpdatePayment,
    handleDeletePayment,
    handlePaymentSelect,
    clearSelectedPayments
  };
};
