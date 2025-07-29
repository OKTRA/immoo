
import React from 'react';
import { Property } from "@/assets/types";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  
  if (!property) return null;

  const getPaymentFrequencyLabel = (frequency: string): string => {
    return t(`propertyDetails.paymentFrequency.${frequency}`) || t('propertyDetails.paymentFrequency.monthly');
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
              {t('propertyDetails.actions.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
