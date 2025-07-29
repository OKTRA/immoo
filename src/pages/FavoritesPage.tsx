import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ArrowLeft, 
  Trash2, 
  MapPin, 
  Eye,
  Share2
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCurrency } from '@/lib/utils';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { 
    favoritesDetails, 
    favoritesCount, 
    isLoading, 
    removeFromFavorites, 
    clearAllFavorites 
  } = useFavorites();

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleShare = (property: any) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Découvrez cette propriété : ${property.title}`,
        url: `${window.location.origin}/property/${property.id}`
      });
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/property/${property.id}`;
      navigator.clipboard.writeText(url);
      // Could add a toast here
    }
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                  Mes Favoris
                </h1>
                <p className="text-gray-600">
                  {favoritesCount > 0 
                    ? `${favoritesCount} propriété${favoritesCount > 1 ? 's' : ''} sauvegardée${favoritesCount > 1 ? 's' : ''}`
                    : 'Aucune propriété favorite'
                  }
                </p>
              </div>
              
              {favoritesCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFavorites}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tout supprimer
                </Button>
              )}
            </div>
          </div>

          {/* Favorites List */}
          {favoritesCount === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun favori pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Explorez nos propriétés et cliquez sur le cœur pour les ajouter à vos favoris.
                </p>
                <Button onClick={() => navigate('/')}>
                  Découvrir les propriétés
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritesDetails.map((property) => (
                <Card key={property.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Property Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {property.imageUrl ? (
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Placeholder */}
                    <div 
                      className="w-full h-full flex items-center justify-center bg-gray-100" 
                      style={{ display: property.imageUrl ? 'none' : 'flex' }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">🏠</div>
                        <p className="text-gray-500 text-sm">Image non disponible</p>
                      </div>
                    </div>

                    {/* Remove from favorites button */}
                    <div className="absolute top-3 right-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromFavorites(property.id);
                        }}
                        title="Retirer des favoris"
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </Button>
                    </div>

                    {/* Added date badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="text-xs bg-white/90">
                        Ajouté le {new Date(property.addedAt).toLocaleDateString('fr-FR')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight mb-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{property.location}</span>
                      </div>
                      
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(property.price)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewProperty(property.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(property)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
