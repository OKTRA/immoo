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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Aucune propriété trouvée</p>
          </div>
        ) : (
          properties.map((property) => (
            <Card key={property.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
              <div className="relative overflow-hidden rounded-t-2xl">
                <PropertyImageGallery
                  propertyId={property.id}
                  images={[]}
                  mainImageUrl={property.imageUrl}
                  height="h-60"
                  className="w-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm rounded-full h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle favorite toggle
                  }}
                >
                  <Heart className="h-4 w-4 text-gray-600" />
                </Button>
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
                    {property.rooms && (
                      <div className="flex items-center gap-1">
                        <Hotel className="h-3 w-3" />
                        <span>{property.rooms} pièces</span>
                      </div>
                    )}
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        <span>{property.bedrooms} ch.</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {property.description}
                  </p>
                  
                  {property.price && (
                    <div className="mb-4">
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(property.price)}</span>
                      <span className="text-sm text-gray-500 ml-1">/ mois</span>
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
                    Voir détails
                  </Button>
                  
                  {agencyId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 hover:border-gray-400 rounded-lg font-medium transition-colors duration-200"
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
