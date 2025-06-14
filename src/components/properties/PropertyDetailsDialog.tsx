
import React from 'react';
import { Property } from "@/assets/types";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PropertyDetailsHeader from './PropertyDetailsHeader';
import PropertyCharacteristics from './PropertyCharacteristics';
import PropertyDescription from './PropertyDescription';
import PropertyFinancialInfo from './PropertyFinancialInfo';
import PropertyFeatures from './PropertyFeatures';
import PropertyAgencyInfo from './PropertyAgencyInfo';

interface PropertyDetailsDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsDialog({ property, isOpen, onClose }: PropertyDetailsDialogProps) {
  if (!property) return null;

  const getPaymentFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      daily: "Journalier",
      weekly: "Hebdomadaire", 
      monthly: "Mensuel",
      quarterly: "Trimestriel",
      biannual: "Semestriel",
      annual: "Annuel"
    };
    return labels[frequency] || "Mensuel";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[850px] max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header avec image et titre */}
          <PropertyDetailsHeader 
            property={property} 
            getPaymentFrequencyLabel={getPaymentFrequencyLabel}
          />

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Caractéristiques principales */}
            <PropertyCharacteristics property={property} />

            {/* Description */}
            <PropertyDescription property={property} />

            {/* Informations financières */}
            <PropertyFinancialInfo 
              property={property} 
              getPaymentFrequencyLabel={getPaymentFrequencyLabel}
            />

            {/* Caractéristiques et équipements */}
            <PropertyFeatures property={property} />

            {/* Informations sur l'agence */}
            <PropertyAgencyInfo property={property} />
          </div>

          {/* Footer avec bouton de fermeture */}
          <div className="border-t bg-background p-4 sm:p-6">
            <Button onClick={onClose} className="w-full text-base py-3">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
