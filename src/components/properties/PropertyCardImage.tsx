
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Property } from '@/assets/types';
import PropertyImagesCarousel from './PropertyImagesCarousel';

interface PropertyCardImageProps {
  property: Property;
  showFavorite: boolean;
  isPublicView: boolean;
  isFavorite: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
}

export default function PropertyCardImage({ 
  property, 
  showFavorite, 
  isPublicView, 
  isFavorite, 
  onFavoriteClick 
}: PropertyCardImageProps) {
  return (
    <div className="relative h-48 overflow-hidden">
      {property.id ? (
        <PropertyImagesCarousel 
          propertyId={property.id} 
          mainImageUrl={property.imageUrl} 
        />
      ) : (
        <img
          src={property.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      )}
      {showFavorite && !isPublicView && (
        <button
          onClick={onFavoriteClick}
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors z-20"
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
          />
        </button>
      )}
      <div className="absolute bottom-2 left-2 z-20">
        <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
          {property.status === 'available' ? 'Disponible' : 'Vendu'}
        </Badge>
      </div>
    </div>
  );
}
