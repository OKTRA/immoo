
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Property } from '@/assets/types';
import PropertyDetailsDialog from '@/components/properties/PropertyDetailsDialog';
import PropertyCardWrapper from '@/components/properties/PropertyCardWrapper';
import PropertyCardImage from '@/components/properties/PropertyCardImage';
import PropertyCardContent from '@/components/properties/PropertyCardContent';
import PropertyCardActions from '@/components/properties/PropertyCardActions';
import { recordView } from '@/services/analytics/viewTrackingService';

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  featured?: boolean;
  isPublicView?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  agencyContactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hasContactAccess?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showActions = true,
  showFavorite = true,
  isFavorite = false,
  featured = false,
  isPublicView = false,
  onToggleFavorite,
  agencyContactInfo,
  hasContactAccess = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Enregistrer la vue de la propriété
    recordView('property', property.id);
    
    if (isPublicView) {
      e.preventDefault();
      setIsDialogOpen(true);
    }
  };

  const getPropertyUrl = () => {
    if (isPublicView) {
      return "#";
    }
    return `/properties/${property.id}`;
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <PropertyCardWrapper
          isPublicView={isPublicView}
          onCardClick={handleCardClick}
          propertyUrl={getPropertyUrl()}
        >
          <PropertyCardImage
            property={property}
            showFavorite={showFavorite}
            isPublicView={isPublicView}
            isFavorite={isFavorite}
            onFavoriteClick={handleFavoriteClick}
          />
          <PropertyCardContent property={property} />
        </PropertyCardWrapper>

        <PropertyCardActions
          showActions={showActions}
          isPublicView={isPublicView}
          property={property}
          agencyContactInfo={agencyContactInfo}
          hasContactAccess={hasContactAccess}
        />
      </Card>

      {isPublicView && (
        <PropertyDetailsDialog 
          property={property}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
};

export default PropertyCard;
