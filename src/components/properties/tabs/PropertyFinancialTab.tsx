
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PiggyBank, FileText, Building2, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PropertyFinancialTabProps {
  property: any;
  agencyId: string | undefined;
  propertyId: string | undefined;
  hasActiveLeases: boolean;
  leases: any[];
  handleViewPayments: (leaseId: string) => void;
}

export default function PropertyFinancialTab({ 
  property, 
  agencyId, 
  propertyId, 
  hasActiveLeases, 
  leases, 
  handleViewPayments 
}: PropertyFinancialTabProps) {
  const listingType = (property as any).listingType || ((property.features || []).includes('for_sale') ? 'sale' : 'rent');
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/40 p-4 rounded-lg">
          <PiggyBank className="h-5 w-5 mb-1 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">{listingType === 'sale' ? 'Prix de vente' : 'Prix'}</div>
          <div className="font-bold text-lg">{formatCurrency(property.price, "FCFA")}</div>
        </div>
        
        {listingType !== 'sale' && property.securityDeposit && (
          <div className="bg-muted/40 p-4 rounded-lg">
            <FileText className="h-5 w-5 mb-1 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Dépôt de garantie</div>
            <div className="font-bold text-lg">{formatCurrency(property.securityDeposit, "FCFA")}</div>
          </div>
        )}
        
        {property.agencyFees && (
          <div className="bg-muted/40 p-4 rounded-lg">
            <Building2 className="h-5 w-5 mb-1 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Frais d'agence</div>
            <div className="font-bold text-lg">{formatCurrency(property.agencyFees, "FCFA")}</div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {listingType !== 'sale' && property.paymentFrequency && (
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Fréquence de paiement</span>
            <span className="font-medium">
              {property.paymentFrequency === "monthly" ? "Mensuel" :
               property.paymentFrequency === "quarterly" ? "Trimestriel" :
               property.paymentFrequency === "biannual" ? "Semestriel" :
               property.paymentFrequency === "annual" ? "Annuel" :
               property.paymentFrequency}
            </span>
          </div>
        )}
        
        {property.commissionRate && (
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">{listingType === 'sale' ? 'Taux de commission vente' : 'Taux de commission'}</span>
            <span className="font-medium">{property.commissionRate}%</span>
          </div>
        )}
      </div>
      
      <div className="pt-4">
        <h3 className="text-lg font-medium mb-4">Gestion financière</h3>
        {listingType === 'sale' ? (
          <div className="space-y-3">
            <Link to={`/agencies/${agencyId}/properties/${propertyId}/sales`}>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Gérer les ventes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {!hasActiveLeases ? (
              <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/create`}>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Créer un nouveau bail
                </Button>
              </Link>
            ) : (
              <>
                <Button disabled variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Cette propriété a déjà un bail actif
                </Button>
                {leases.filter((lease: any) => lease.status === 'active').map((lease: any) => (
                  <Button 
                    key={`payments-btn-${lease.id}`}
                    variant="default" 
                    className="w-full"
                    onClick={() => handleViewPayments(lease.id)}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Gérer les paiements
                  </Button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
