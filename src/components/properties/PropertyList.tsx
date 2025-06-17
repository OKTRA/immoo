import { useState } from "react";
import { Property } from "@/assets/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Home, MapPin, Ruler, Hotel, Bath, Tag, Edit, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import QuickVisitorLogin from "@/components/visitor/QuickVisitorLogin";
import { useQuickVisitorAccess } from "@/hooks/useQuickVisitorAccess";
import { Link } from "react-router-dom";
import { PropertyImageService } from "@/services/property/propertyImageService";

interface PropertyListProps {
  properties: Property[];
  agencyId?: string;
}

export default function PropertyList({ properties, agencyId }: PropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMiniLogin, setShowMiniLogin] = useState(false);
  
  // Use the visitor access hook for public view
  const { isLoggedIn, isLoading } = useQuickVisitorAccess();
  
  const openPropertyDetails = (property: Property) => {
    console.log('🏠 openPropertyDetails called:', { 
      propertyTitle: property.title,
      agencyId, 
      isLoggedIn, 
      isLoading 
    });
    
    setSelectedProperty(property);
    
    // If this is public view and user is not logged in, show mini login
    if (!agencyId && !isLoggedIn) {
      console.log('🏠 Opening mini login');
      setShowMiniLogin(true);
    } else {
      console.log('🏠 Opening property details directly');
      // Direct access to details (agency view or visitor logged in)
      setIsDialogOpen(true);
    }
  };
  
  const closePropertyDetails = () => {
    setIsDialogOpen(false);
    setShowMiniLogin(false);
    setSelectedProperty(null);
  };

  const handleMiniLoginSuccess = (visitorData: any) => {
    // After successful login, open property details
    console.log('✅ Quick login successful:', visitorData);
    setShowMiniLogin(false);
    setIsDialogOpen(true);
  };
  
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Home className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Aucune propriété trouvée
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Il n'y a pas de propriétés disponibles pour le moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <Card 
            key={property.id} 
            className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 rounded-2xl flex flex-col"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Property Image */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={PropertyImageService.getImageUrl(property.imageUrl)} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                onClick={() => agencyId ? null : openPropertyDetails(property)}
                onError={(e) => {
                  e.currentTarget.src = PropertyImageService.getImageUrl(null);
                }}
              />
              
              {/* Status Badge */}
              <Badge 
                className="absolute top-4 right-4 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-0 font-medium px-3 py-1.5" 
                variant="secondary"
              >
                {property.status === "available" ? "Disponible" :
                 property.status === "sold" ? "Vendu" :
                 property.status === "pending" ? "En attente" :
                 property.status}
              </Badge>

              {/* Favorite Button (for non-agency view) */}
              {!agencyId && (
                <button className="absolute top-4 left-4 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors">
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl line-clamp-1 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <span className="font-bold text-xl text-primary bg-primary/10 px-3 py-1 rounded-lg">
                    {formatCurrency(property.price)}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm">{property.location}</span>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="flex flex-wrap gap-4 py-2 flex-1">
                <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Ruler className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">{property.area} m²</span>
                </div>
                
                {property.bedrooms > 0 && (
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <Hotel className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">{property.bedrooms} ch.</span>
                  </div>
                )}
                
                {property.bathrooms > 0 && (
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <Bath className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">{property.bathrooms} SdB</span>
                  </div>
                )}
                
                {property.type && (
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <Tag className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">{property.type}</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Always at bottom */}
              <div className="mt-auto pt-4">
                {agencyId ? (
                  // Agency management context
                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      className="flex-1 h-12 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300" 
                      asChild
                    >
                      <Link to={`/agencies/${agencyId}/properties/${property.id}`} className="flex items-center justify-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 font-medium rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
                      asChild
                    >
                      <Link to={`/agencies/${agencyId}/properties/${property.id}/edit`} className="flex items-center justify-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Link>
                    </Button>
                  </div>
                ) : (
                  // Public context
                  <Button 
                    variant="default" 
                    className="w-full h-12 font-medium rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all duration-300" 
                    onClick={() => openPropertyDetails(property)}
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isLoading ? "Chargement..." : "Voir les détails"}
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
      {isDialogOpen && selectedProperty && (agencyId || isLoggedIn) && (
        <PropertyDetailsDialog 
          property={selectedProperty} 
          isOpen={isDialogOpen} 
          onClose={closePropertyDetails} 
        />
      )}
    </>
  );
}
