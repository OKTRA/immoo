import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Home, User, CreditCard, Receipt, CheckCircle, XCircle } from "lucide-react";
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";

interface LeaseDetailsDialogProps {
  lease: any | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onViewPayments: (leaseId: string) => void;
}

const LeaseDetailsDialog: React.FC<LeaseDetailsDialogProps> = ({
  lease,
  isOpen,
  isLoading = false,
  onClose,
  onViewPayments
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Si le bail n'est pas chargé ou est null
  if (!lease && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Détails du bail {lease && getStatusBadge(lease.status)}
          </DialogTitle>
          <DialogDescription>
            Aperçu rapide des informations du bail
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        ) : lease ? (
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Home className="mr-2 h-4 w-4" /> Propriété
                </h3>
                <p className="text-sm font-semibold">
                  {lease.property?.title || lease.properties?.title || "Non spécifiée"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="mr-2 h-4 w-4" /> Locataire
                </h3>
                <p className="text-sm font-semibold">
                  {lease.tenant ? 
                    `${lease.tenant.first_name} ${lease.tenant.last_name}` : 
                    lease.tenants ? 
                    `${lease.tenants.first_name} ${lease.tenants.last_name}` :
                    "Non spécifié"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Date de début
                  </h3>
                  <p className="text-sm">
                    {lease.start_date ? format(new Date(lease.start_date), 'dd/MM/yyyy') : "Non définie"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Date de fin
                  </h3>
                  <p className="text-sm">
                    {lease.end_date ? format(new Date(lease.end_date), 'dd/MM/yyyy') : "Non définie"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Loyer mensuel</h3>
                  <p className="text-sm font-semibold">{formatCurrency(lease.monthly_rent || 0)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Caution</h3>
                  <p className="text-sm font-semibold">{formatCurrency(lease.security_deposit || 0)}</p>
                </div>
              </div>

              {/* Liste des paiements si disponible */}
              {lease.payments && lease.payments.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                    <CreditCard className="mr-2 h-4 w-4" /> Paiements ({lease.payments.length})
                  </h3>
                  <div className="space-y-3">
                    {lease.payments.map((p:any) => (
                      <div key={p.id} className="flex items-center justify-between border rounded px-3 py-2 shadow-sm bg-gray-50">
                        <div className="flex items-center gap-2">
                          {p.status === 'paid' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium capitalize">{p.payment_type || 'Paiement'}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          
          {lease && (
            <div className="flex gap-2">
              <Button 
                variant="default"
                onClick={() => lease.id && onViewPayments(lease.id)}
              >
                <Receipt className="mr-2 h-4 w-4" /> Gestion des paiements
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaseDetailsDialog;
