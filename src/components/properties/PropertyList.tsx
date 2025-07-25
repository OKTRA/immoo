import { useState, useEffect } from "react";
import { Property } from "@/assets/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Home, MapPin, Ruler, Hotel, Bath, Tag, Edit, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import QuickVisitorLogin from "@/components/visitor/QuickVisitorLogin";
import { useQuickVisitorAccess, refreshVisitorState } from "@/hooks/useQuickVisitorAccess";
import { useNavigate } from "react-router-dom";
import PropertyImageGallery from "./PropertyImageGallery";


interface PropertyListProps {
  properties: Property[];
  agencyId?: string;
}

export default function PropertyList({ properties, agencyId }: PropertyListProps) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMiniLogin, setShowMiniLogin] = useState(false);
  const [forceLoggedIn, setForceLoggedIn] = useState(false);

  
  // Use the visitor access hook for public view
  const { isLoggedIn, isLoading } = useQuickVisitorAccess();
  
  // Combined logged in state (either from hook or forced after login)
  const effectivelyLoggedIn = isLoggedIn || forceLoggedIn;
  
  const openPropertyDetails = (property: Property) => {
    console.log('🏠 openPropertyDetails called:', { 
      propertyTitle: property.title,
      agencyId, 
      isLoggedIn: effectivelyLoggedIn, 
      isLoading 
    });
    
    // Toujours stocker la propriété sélectionnée
    setSelectedProperty(property);
    
    // For public view (no agencyId)
    if (!agencyId) {
      // Rafraîchir l'état de connexion pour être sûr d'avoir les dernières infos
      refreshVisitorState();
      
      // Check if user is logged in
      if (effectivelyLoggedIn) {
        console.log('🏠 Navigating to public property page');
        navigate(`/property/${property.id}`);
      } else {
        console.log('🔒 User not logged in, showing mini login');
        setShowMiniLogin(true);
      }
      return;
    }
    
    // For agency view, keep the existing dialog behavior
    console.log('🏠 Opening property details dialog');
    setIsDialogOpen(true);
  };
  
  const closePropertyDetails = () => {
    setIsDialogOpen(false);
    setShowMiniLogin(false);
    setSelectedProperty(null);
    // Reset forced logged in state when closing
    setForceLoggedIn(false);
  };

  const handleMiniLoginSuccess = (visitorData: any) => {
    // After successful login, open property details
    console.log('✅ Quick login successful:', visitorData);
    
    // Forcer la mise à jour de l'état de connexion
    setShowMiniLogin(false);
    setForceLoggedIn(true);
    
    // Si nous avons une propriété sélectionnée, naviguer vers sa page de détails
    if (selectedProperty) {
      // Légère pause pour s'assurer que le toast est visible avant la navigation
      setTimeout(() => {
        navigate(`/property/${selectedProperty.id}`);
      }, 500);
    }
  };
  


  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {properties.length} propriété{properties.length !== 1 ? 's' : ''} trouvée{properties.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Aucune propriété trouvée</p>
          </div>
        ) : (
          properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <PropertyImageGallery
                  propertyId={property.id}
                  images={[]}
                  mainImageUrl={property.imageUrl}
                  height="200"
                  className="w-full"
                />
              <Badge className="absolute top-2 left-2 bg-primary/90">
                {formatCurrency(property.price)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle favorite toggle
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{property.location || property.address}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                {property.surface && (
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    <span>{property.surface} m²</span>
                  </div>
                )}
                {property.rooms && (
                  <div className="flex items-center gap-1">
                    <Hotel className="h-4 w-4" />
                    <span>{property.rooms} pièces</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bedrooms} chambres</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {property.description}
              </p>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => openPropertyDetails(property)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </Button>
                
                {agencyId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
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
