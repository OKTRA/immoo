
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Property } from '@/assets/types';
import { formatCurrency } from '@/lib/utils';

interface PropertyCardContentProps {
  property: Property;
}

export default function PropertyCardContent({ property }: PropertyCardContentProps) {
  return (
    <CardContent className="pt-4">
      <div className="mb-2">
        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
        <p className="text-muted-foreground text-sm">{property.location}</p>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-primary">{formatCurrency(property.price)}</span>
        <span className="text-sm text-muted-foreground">{property.area} m²</span>
      </div>

      <div className="flex space-x-4 text-sm text-muted-foreground">
        <div>{property.bedrooms} chambres</div>
        <div>{property.bathrooms} SdB</div>
        {property.propertyCategory && <div>{property.propertyCategory}</div>}
      </div>
    </CardContent>
  );
}
