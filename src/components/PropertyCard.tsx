
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Mail, Calendar, Phone } from 'lucide-react';
import { Property } from '@/assets/types';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import AuthRequired from '@/components/AuthRequired';

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  featured?: boolean;
  isPublicView?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showActions = true,
  showFavorite = true,
  isFavorite = false,
  featured = false,
  isPublicView = false,
  onToggleFavorite
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {showFavorite && !isPublicView && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
              />
            </button>
          )}
          <div className="absolute bottom-2 left-2">
            <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
              {property.status === 'available' ? 'Disponible' : 'Vendu'}
            </Badge>
          </div>
        </div>
      </Link>

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

      {showActions && (
        <CardFooter className="pt-0">
          {isPublicView ? (
            <PublicPropertyActions />
          ) : (
            <PropertyActions property={property} />
          )}
        </CardFooter>
      )}
    </Card>
  );
};

const PublicPropertyActions = () => {
  return (
    <div className="flex space-x-2 mt-4">
      <Button size="sm" variant="outline" className="flex-1" disabled>
        <span className="mr-1">Contact</span>
        <Phone className="h-3.5 w-3.5" />
      </Button>
      <div className="text-xs text-muted-foreground flex-1 text-center py-2">
        Remplissez le formulaire pour contacter l'agence
      </div>
    </div>
  );
};

const PropertyActions = ({ property }: { property: Property }) => {
  return (
    <AuthRequired redirectTo="/auth">
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          <span className="mr-1">Contact</span>
          <Mail className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <span className="mr-1">Book</span>
          <Calendar className="h-3.5 w-3.5" />
        </Button>
      </div>
    </AuthRequired>
  );
};

export default PropertyCard;
