
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface DisplayStatus {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
}

export const usePropertyLeases = (propertyId: string | undefined) => {
  const [leases, setLeases] = useState<any[]>([]);
  const [isLoadingLeases, setIsLoadingLeases] = useState(true);
  
  useEffect(() => {
    const fetchLeases = async () => {
      if (!propertyId) return;
      
      try {
        setIsLoadingLeases(true);
        const { data, error } = await supabase
          .from('leases')
          .select(`
            *,
            tenants!fk_leases_tenant_id (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('property_id', propertyId);
        
        if (error) throw error;
        setLeases(data || []);
      } catch (err) {
        console.error('Error fetching leases:', err);
        toast.error("Impossible de charger les baux pour cette propriété");
      } finally {
        setIsLoadingLeases(false);
      }
    };
    
    fetchLeases();
  }, [propertyId]);

  const formatPropertyStatus = useCallback((status: string): DisplayStatus => {
    switch (status) {
      case "available":
        return { label: "Disponible", variant: "default" };
      case "sold":
        return { label: "Vendu", variant: "destructive" };
      case "pending":
        return { label: "En attente", variant: "secondary" };
      case "rented":
        return { label: "Loué", variant: "success" };
      case "occupied":
        return { label: "Occupé", variant: "success" };
      default:
        return { label: status, variant: "outline" };
    }
  }, []);

  const hasActiveLeases = leases.filter((lease: any) => lease.is_active === true).length > 0;
  const activeLeaseId = hasActiveLeases ? leases.filter((lease: any) => lease.is_active === true)[0]?.id : undefined;

  return {
    leases,
    isLoadingLeases,
    hasActiveLeases,
    activeLeaseId,
    formatPropertyStatus
  };
};
