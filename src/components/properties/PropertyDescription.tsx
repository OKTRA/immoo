
import React from 'react';
import { Property } from "@/assets/types";
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyDescriptionProps {
  property: Property;
}

export default function PropertyDescription({ property }: PropertyDescriptionProps) {
  const { t } = useTranslation();
  
  if (!property.description) return null;

  return (
    <div className="bg-muted/30 rounded-xl p-4 sm:p-6">
      <h3 className="font-semibold text-lg mb-3">{t('propertyDetails.description.title')}</h3>
      <p className="text-muted-foreground leading-relaxed">{property.description}</p>
    </div>
  );
}
