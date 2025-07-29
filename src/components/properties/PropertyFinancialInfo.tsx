
import React from 'react';
import { Property } from "@/assets/types";
import { Euro, Home, ShieldCheck, Building, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyFinancialInfoProps {
  property: Property;
  getPaymentFrequencyLabel: (frequency: string) => string;
}

export default function PropertyFinancialInfo({ property, getPaymentFrequencyLabel }: PropertyFinancialInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4 sm:p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <Euro className="h-5 w-5 mr-2 text-green-600" />
        {t('propertyDetails.financial.title')}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Loyer */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Home className="h-5 w-5 mr-2 text-green-600" />
            <h4 className="font-medium">{t('propertyDetails.financial.rent')} {property.paymentFrequency ? getPaymentFrequencyLabel(property.paymentFrequency).toLowerCase() : t('propertyDetails.paymentFrequency.monthly').toLowerCase()}</h4>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {formatCurrency(property.price, "FCFA")}
          </p>
        </div>

        {/* Dépôt de garantie */}
        {property.securityDeposit && (
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
              <h4 className="font-medium">{t('propertyDetails.financial.securityDeposit')}</h4>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(property.securityDeposit, "FCFA")}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Frais d'agence */}
        {property.agencyFees && (
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Building className="h-5 w-5 mr-2 text-orange-600" />
              <h4 className="font-medium">{t('propertyDetails.financial.agencyFees')}</h4>
            </div>
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(property.agencyFees, "FCFA")}
            </p>
          </div>
        )}

        {/* Taux de commission */}
        {property.commissionRate && (
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Tag className="h-5 w-5 mr-2 text-purple-600" />
              <h4 className="font-medium">{t('propertyDetails.financial.commission')}</h4>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {property.commissionRate}%
            </p>
          </div>
        )}
      </div>

      {/* Coût total initial */}
      {(property.securityDeposit || property.agencyFees) && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200">
            💰 {t('propertyDetails.financial.totalCost')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t('propertyDetails.financial.rent')} ({getPaymentFrequencyLabel(property.paymentFrequency || 'monthly').toLowerCase()})</span>
              <span className="font-medium">{formatCurrency(property.price, "FCFA")}</span>
            </div>
            {property.securityDeposit && (
              <div className="flex justify-between">
                <span>{t('propertyDetails.financial.caution')}</span>
                <span className="font-medium">{formatCurrency(property.securityDeposit, "FCFA")}</span>
              </div>
            )}
            {property.agencyFees && (
              <div className="flex justify-between">
                <span>{t('propertyDetails.financial.agencyFees')}</span>
                <span className="font-medium">{formatCurrency(property.agencyFees, "FCFA")}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-base text-green-800 dark:text-green-200">
              <span>{t('propertyDetails.financial.totalInitial')}</span>
              <span>
                {formatCurrency(
                  property.price + 
                  (property.securityDeposit || 0) + 
                  (property.agencyFees || 0), 
                  "FCFA"
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
