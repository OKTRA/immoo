
import React from 'react';
import { Property } from "@/assets/types";
import { Ruler, Hotel, Bath, Tag } from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyCharacteristicsProps {
  property: Property;
}

export default function PropertyCharacteristics({ property }: PropertyCharacteristicsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-primary/5 rounded-xl p-4 text-center">
        <Ruler className="h-6 w-6 mx-auto mb-2 text-primary" />
        <p className="text-xs text-muted-foreground mb-1">{t('propertyDetails.characteristics.surface')}</p>
        <p className="font-bold text-lg">{property.area} m²</p>
      </div>
      
      {property.bedrooms > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center">
          <Hotel className="h-6 w-6 mx-auto mb-2 text-blue-600" />
          <p className="text-xs text-muted-foreground mb-1">{t('propertyDetails.characteristics.bedrooms')}</p>
          <p className="font-bold text-lg">{property.bedrooms}</p>
        </div>
      )}
      
      {property.bathrooms > 0 && (
        <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-xl p-4 text-center">
          <Bath className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
          <p className="text-xs text-muted-foreground mb-1">{t('propertyDetails.characteristics.bathrooms')}</p>
          <p className="font-bold text-lg">{property.bathrooms}</p>
        </div>
      )}
      
      {property.type && (
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 text-center">
          <Tag className="h-6 w-6 mx-auto mb-2 text-purple-600" />
          <p className="text-xs text-muted-foreground mb-1">{t('propertyDetails.characteristics.type')}</p>
          <p className="font-bold text-sm">{property.type}</p>
        </div>
      )}
    </div>
  );
}
