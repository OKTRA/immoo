import { useState } from "react";
import { Property } from "@/assets/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Home, MapPin, Ruler, Hotel, Bath, Tag, Edit, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import VisitorContactForm from "@/components/visitor/VisitorContactForm";
import { useVisitorContact } from "@/hooks/useVisitorContact";
import { Link } from "react-router-dom";

interface PropertyListProps {
  properties: Property[];
  agencyId?: string;
}

export default function PropertyList({ properties, agencyId }: PropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Use the visitor contact hook only for public view (when no agencyId)
  const { isAuthorized, isLoading, submitContactForm } = useVisitorContact(
    !agencyId && selectedProperty?.agencyId ? selectedProperty.agencyId : ""
  );
  
  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    
    // If this is public view and user doesn't have access, show contact form
    if (!agencyId && property.agencyId && !isAuthorized) {
      setShowContactForm(true);
    } else {
      // Direct access to details (agency view or already authorized)
      setIsDialogOpen(true);
    }
  };
  
  const closePropertyDetails = () => {
    setIsDialogOpen(false);
    setShowContactForm(false);
    setSelectedProperty(null);
  };

  const handleContactFormSubmit = async (formData: any) => {
    if (!selectedProperty?.agencyId) return { success: false };
    
    const result = await submitContactForm(formData);
    
    if (result.success) {
      // Close contact form and open property details
      setShowContactForm(false);
      setIsDialogOpen(true);
    }
    
    return result;
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
            className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 rounded-2xl"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Property Image */}
            <div className="relative h-64 overflow-hidden">
              {property.imageUrl ? (
                <img 
                  src={property.imageUrl} 
                  alt={property.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                  onClick={() => agencyId ? null : openPropertyDetails(property)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center cursor-pointer"
                     onClick={() => agencyId ? null : openPropertyDetails(property)}>
                  <Home className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
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
            
            <CardContent className="p-6 space-y-4">
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
              <div className="flex flex-wrap gap-4 py-2">
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
              
              {/* Action Buttons */}
              <div className="pt-2">
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
      
      {/* Visitor Contact Form */}
      {!agencyId && showContactForm && selectedProperty && (
        <VisitorContactForm
          agencyName={selectedProperty.agencyName || "cette agence"}
          onSubmit={handleContactFormSubmit}
          isLoading={isLoading}
          onClose={closePropertyDetails}
        />
      )}
      
      {/* Property Details Dialog - Only show when authorized or in agency context */}
      {isDialogOpen && selectedProperty && (agencyId || isAuthorized) && (
        <PropertyDetailsDialog 
          property={selectedProperty} 
          isOpen={isDialogOpen} 
          onClose={closePropertyDetails} 
        />
      )}
    </>
  );
}
