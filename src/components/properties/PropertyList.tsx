import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Ruler, 
  Hotel, 
  Bath,
  Home,
  Building2, 
  Store,
  Heart, 
  Eye, 
  Edit
} from 'lucide-react';
import { Property } from '@/assets/types';
import { formatCurrency } from '@/lib/utils';
import PropertyDetailsDialog from './PropertyDetailsDialog';
import QuickVisitorLogin from '@/components/visitor/QuickVisitorLogin';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { isBlobUrl } from '@/utils/imageUrlUtils';
import { useFavorites } from '@/hooks/useFavorites';
import { getPropertyStatusLabel, getPropertyStatusVariant } from '@/utils/translationUtils';
import { SaleStatusBadge } from '@/utils/saleStatusUtils';
import PropertyImageGallery from './PropertyImageGallery';

interface PropertyListProps {
  properties: Property[];
  agencyId?: string;
}

export default function PropertyList({ properties, agencyId }: PropertyListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMiniLogin, setShowMiniLogin] = useState(false);
  const { favoritesSet, isFavorite, toggleFavorite } = useFavorites();

  const effectivelyLoggedIn = user || localStorage.getItem('visitorData');

  // Handle favorite toggle with event stopping
  const handleFavoriteToggle = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property);
  };

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    
    if (agencyId || effectivelyLoggedIn) {
      setIsDialogOpen(true);
    } else {
      setShowMiniLogin(true);
    }
  };

  const closePropertyDetails = () => {
    setSelectedProperty(null);
    setIsDialogOpen(false);
    setShowMiniLogin(false);
  };

  const handleMiniLoginSuccess = (visitorData: any) => {
    localStorage.setItem('visitorData', JSON.stringify(visitorData));
    if (selectedProperty) {
      setIsDialogOpen(true);
    }
  };

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <Hotel className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune propriété trouvée</h3>
          <p className="text-gray-500">Aucune propriété ne correspond à vos critères de recherche.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Property Image Gallery */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <PropertyImageGallery 
                propertyId={property.id}
                mainImageUrl={property.imageUrl}
                images={property.images || []}
                height="h-48"
                enableZoom={false}
                showThumbnails={false}
                showControls={true}
              />
              
              {/* Combined Sale Badge for sale properties */}
              {property.listingType === 'sale' ? (
                <div className="absolute top-3 left-3">
                  <SaleStatusBadge status={property.status || 'available'} size="sm" />
                </div>
              ) : (
                /* Original status badge for rental properties */
                property.status && (
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={getPropertyStatusVariant(property.status)}
                      className="text-xs"
                    >
                      {getPropertyStatusLabel(property.status, t)}
                    </Badge>
                  </div>
                )
              )}
              
              {/* Favorite Button */}
              <div className="absolute top-3 right-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                    isFavorite(property.id)
                      ? 'bg-red-50 hover:bg-red-100 border border-red-200'
                      : 'bg-white/80 hover:bg-white'
                  }`}
                  onClick={(e) => handleFavoriteToggle(property, e)}
                  title={isFavorite(property.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart 
                    className={`h-4 w-4 transition-all duration-200 ${
                      isFavorite(property.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-600 hover:text-red-400'
                    }`} 
                  />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-5 flex flex-col h-[280px]">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">{property.title}</h3>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{property.location || property.address}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  {property.surface && (
                    <div className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      <span>{property.surface} m²</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Hotel className="h-3 w-3" />
                      <span>{property.bedrooms} {t('propertyCard.bedrooms')}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      <span>{property.bathrooms} {t('propertyCard.bathrooms') || 'Sdb'}</span>
                    </div>
                  )}
                  {(((property as any).living_rooms ?? (property as any).livingRooms) > 0 || (property as any).kitchens > 0 || (property as any).shops > 0) && (
                    <div className="flex items-center gap-2">
                      {(((property as any).living_rooms ?? (property as any).livingRooms) > 0) && (
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          <span className="text-xs text-gray-500">{((property as any).living_rooms ?? (property as any).livingRooms)}</span>
                        </div>
                      )}
                      {((property as any).kitchens > 0) && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span className="text-xs text-gray-500">{(property as any).kitchens}</span>
                        </div>
                      )}
                      {((property as any).shops > 0) && (
                        <div className="flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          <span className="text-xs text-gray-500">{(property as any).shops}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {property.description}
                </p>
                
                {property.price && (
                  <div className="mb-4">
                    <div className="space-y-1">
                      <div>
                        <span className="text-lg font-semibold text-gray-900">{formatCurrency(property.price)}</span>
                        {((property as any).listingType || ((property.features || []).includes('for_sale') ? 'sale' : 'rent')) === 'sale' ? (
                          <span className="text-sm text-gray-500 ml-1">Prix de vente</span>
                        ) : (
                          <span className="text-sm text-gray-500 ml-1">/ mois</span>
                        )}
                      </div>
                      
                      {/* Les informations financières détaillées sont affichées dans la page de détails */}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                <Button 
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200" 
                  size="sm"
                  onClick={() => openPropertyDetails(property)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('propertyCard.viewDetails')}
                </Button>
                
                {agencyId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 hover:border-gray-400 rounded-lg font-medium transition-colors duration-200"
                    onClick={() => navigate(`/agencies/${agencyId}/properties/${property.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Visitor Login */}
      {!agencyId && showMiniLogin && selectedProperty && (
        <QuickVisitorLogin
          isOpen={showMiniLogin}
          onClose={closePropertyDetails}
          onSuccess={handleMiniLoginSuccess}
        />
      )}
      
      {/* Property Details Dialog - Only show when logged in or in agency context */}
      {isDialogOpen && selectedProperty && (agencyId || effectivelyLoggedIn) && (
        <PropertyDetailsDialog 
          property={selectedProperty} 
          isOpen={isDialogOpen} 
          onClose={closePropertyDetails} 
        />
      )}
    </div>
  );
}
