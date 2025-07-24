import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, Calendar, DollarSign, FileText, Link2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { attachContractToLease } from '@/services/contracts/leaseContractService';
import { toast } from 'sonner';

interface AttachLeaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: {
    id?: string;
    title: string;
    type: string;
  } | null;
  agencyId: string;
  onSuccess?: () => void;
}

interface LeaseOption {
  id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  properties: {
    title: string;
    location: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

export default function AttachLeaseDialog({ 
  isOpen, 
  onClose, 
  contract, 
  agencyId,
  onSuccess 
}: AttachLeaseDialogProps) {
  const [availableLeases, setAvailableLeases] = useState<LeaseOption[]>([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);

  useEffect(() => {
    if (isOpen && agencyId) {
      fetchAvailableLeases();
    }
  }, [isOpen, agencyId]);

  const fetchAvailableLeases = async () => {
    setLoading(true);
    try {
      // Récupérer tous les baux actifs de l'agence qui n'ont pas encore de contrat rattaché
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          start_date,
          end_date,
          monthly_rent,
          properties!inner (
            id,
            title,
            location,
            agency_id
          ),
          tenants:tenant_id (
            first_name,
            last_name
          )
        `)
        .eq('properties.agency_id', agencyId)
        .eq('status', 'active');

      if (error) throw error;

      // Filtrer ceux qui n'ont pas de contrat
      const { data: contractedLeases, error: contractError } = await supabase
        .from('contracts')
        .select('lease_id')
        .not('lease_id', 'is', null);

      if (contractError) {
        console.error('Error fetching contracted leases:', contractError);
      }

      const contractedLeaseIds = contractedLeases?.map(c => c.lease_id) || [];
      const availableLeases = data?.filter(lease => !contractedLeaseIds.includes(lease.id)) || [];

      setAvailableLeases(availableLeases);
    } catch (error) {
      console.error('Error fetching available leases:', error);
      toast.error('Erreur lors du chargement des baux disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = async () => {
    if (!contract || !contract.id || !selectedLeaseId) return;

    setIsAttaching(true);
    try {
      const success = await attachContractToLease(contract.id, selectedLeaseId);
      if (success) {
        onSuccess?.();
        onClose();
        setSelectedLeaseId('');
      }
    } catch (error) {
      console.error('Error attaching contract to lease:', error);
    } finally {
      setIsAttaching(false);
    }
  };

  const selectedLease = availableLeases.find(lease => lease.id === selectedLeaseId);

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Rattacher le contrat à un bail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations du contrat */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrat sélectionné
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{contract.title}</p>
                  <p className="text-sm text-muted-foreground">Type: {contract.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection du bail */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choisir un bail</label>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Chargement des baux...</p>
              </div>
            ) : availableLeases.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Aucun bail disponible pour rattachement</p>
              </div>
            ) : (
              <Select value={selectedLeaseId} onValueChange={setSelectedLeaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un bail..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLeases.map((lease) => (
                    <SelectItem key={lease.id} value={lease.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>
                          {lease.properties.title} - {lease.tenants.first_name} {lease.tenants.last_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Aperçu du bail sélectionné */}
          {selectedLease && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du bail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Propriété</p>
                      <p className="font-medium">{selectedLease.properties.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Locataire</p>
                      <p className="font-medium">
                        {selectedLease.tenants.first_name} {selectedLease.tenants.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Période</p>
                      <p className="font-medium">
                        Du {new Date(selectedLease.start_date).toLocaleDateString()} 
                        au {new Date(selectedLease.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Loyer</p>
                      <p className="font-medium">
                        {selectedLease.monthly_rent.toLocaleString()} FCFA/mois
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAttaching}>
            Annuler
          </Button>
          <Button 
            onClick={handleAttach} 
            disabled={!selectedLeaseId || isAttaching}
          >
            {isAttaching ? 'Rattachement...' : 'Rattacher le contrat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 