
import React from 'react';
import { Property } from "@/assets/types";
import { Car, Wifi, Droplets, Zap, Shield, Mountain, CheckCircle } from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyFeaturesProps {
  property: Property;
}

export default function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const { t } = useTranslation();
  
  if (!property.features || property.features.length === 0) return null;

  const getFeatureIcon = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('parking') || featureLower.includes('garage')) return <Car className="h-4 w-4" />;
    if (featureLower.includes('wifi') || featureLower.includes('internet')) return <Wifi className="h-4 w-4" />;
    if (featureLower.includes('piscine') || featureLower.includes('pool')) return <Droplets className="h-4 w-4" />;
    if (featureLower.includes('électricité') || featureLower.includes('electric')) return <Zap className="h-4 w-4" />;
    if (featureLower.includes('sécurité') || featureLower.includes('security')) return <Shield className="h-4 w-4" />;
    if (featureLower.includes('jardin') || featureLower.includes('garden')) return <Mountain className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 sm:p-6">
      <h3 className="font-semibold text-lg mb-4">{t('propertyDetails.features.title')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {property.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/40 rounded-lg p-3">
            {getFeatureIcon(feature)}
            <span className="text-sm font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
