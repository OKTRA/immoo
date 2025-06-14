import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById, getPropertiesByAgencyId } from "@/services/agency";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, MapPin, Star, Phone, Mail, Globe, BadgeCheck, 
  Home, ArrowLeft, TrendingUp, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import { useVisitorContact } from "@/hooks/useVisitorContact";
import VisitorContactForm from "@/components/visitor/VisitorContactForm";
import { toast } from "sonner";
import PublicPageWrapper from "@/components/PublicPageWrapper";

export default function PublicAgencyPage() {
  const { agencyId } = useParams();
  
  console.log('PublicAgencyPage - Rendering with agencyId:', agencyId);
  console.log('PublicAgencyPage - Current URL:', window.location.href);
  
  const { 
    isAuthorized, 
    isLoading: isContactLoading, 
    submitContactForm,
    checkAccess
  } = useVisitorContact(agencyId || '');
  
  console.log('PublicAgencyPage - Contact state:', { isAuthorized, isContactLoading });
  
  // Cette page est ENTIÈREMENT PUBLIQUE - aucune authentification requise
  const { data: agencyData, isLoading: isLoadingAgency } = useQuery({
    queryKey: ['public-agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId
  });

  const { data: propertiesData, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['public-agency-properties', agencyId],
    queryFn: () => getPropertiesByAgencyId(agencyId || ''),
    enabled: !!agencyId
  });

  const agency = agencyData?.agency;
  const properties = propertiesData?.properties || [];

  const handleContactFormSubmit = async (formData: any) => {
    console.log('PublicAgencyPage - Submitting contact form:', formData);
    const result = await submitContactForm(formData);
    
    if (result.success) {
      toast.success(
        result.isNewVisitor 
          ? "Merci ! Vous avez maintenant accès aux informations de contact." 
          : "Bon retour ! Vous avez toujours accès aux informations de contact."
      );
      // Force recheck access after successful form submission
      await checkAccess();
    } else {
      toast.error(result.error || "Une erreur s'est produite");
    }
    
    return result;
  };

  if (isLoadingAgency || isContactLoading) {
    return (
      <PublicPageWrapper>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          <div className="container mx-auto px-4 py-16">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/50 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-muted/50 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-32 bg-muted/50 rounded-xl"></div>
                  <div className="h-48 bg-muted/50 rounded-xl"></div>
                </div>
                <div className="h-96 bg-muted/50 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PublicPageWrapper>
    );
  }

  if (!agency) {
    return (
      <PublicPageWrapper>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          <div className="container mx-auto px-4 py-16 text-center">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Agence introuvable</h1>
            <p className="text-muted-foreground mb-6">Cette agence n'existe pas ou a été supprimée.</p>
            <Button asChild>
              <Link to="/browse-agencies">Retour aux agences</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </PublicPageWrapper>
    );
  }

  const safeRating = typeof agency.rating === 'number' ? agency.rating : 0;

  // Composant pour afficher les informations de contact protégées
  const ContactInfo = () => {
    console.log('ContactInfo - isAuthorized:', isAuthorized, 'agency contact info:', { phone: agency.phone, email: agency.email, website: agency.website });
    
    if (!isAuthorized) {
      return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Informations de contact</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Pour accéder aux coordonnées de cette agence, veuillez vous identifier.
          </p>
          <p className="text-xs text-muted-foreground">
            Cette démarche nous aide à vous offrir un service personnalisé.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Informations de contact
        </h3>
        <div className="space-y-3">
          {agency.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-3 text-gray-400" />
              <a 
                href={`tel:${agency.phone}`}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                {agency.phone}
              </a>
            </div>
          )}
          {agency.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-3 text-gray-400" />
              <a 
                href={`mailto:${agency.email}`}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                {agency.email}
              </a>
            </div>
          )}
          {agency.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-3 text-gray-400" />
              <a 
                href={agency.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Site web
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicPageWrapper>
      <Navbar />
      
      {/* Formulaire de contact visiteur - affiché SEULEMENT si pas autorisé */}
      {!isAuthorized && (
        <VisitorContactForm
          agencyName={agency.name}
          onSubmit={handleContactFormSubmit}
          isLoading={isContactLoading}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/browse-agencies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux agences
            </Link>
          </Button>

          {/* Agency Header */}
          <AnimatedCard className="p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Agency Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-background">
                      {agency.logoUrl ? (
                        <img 
                          src={agency.logoUrl} 
                          alt={agency.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <Building className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    {agency.verified && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                        <BadgeCheck className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {agency.name}
                    </h1>
                    {agency.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="text-lg">{agency.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-2 text-lg font-semibold">{safeRating.toFixed(1)}</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">/ 5</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Home className="h-5 w-5 mr-2" />
                        <span>{agency.properties} propriété{agency.properties > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {agency.specialties && agency.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {agency.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {agency.description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">À propos de l'agence</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {agency.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact & Stats */}
              <div className="space-y-6">
                {/* Contact Information - Now Protected */}
                <ContactInfo />

                {/* Quick Stats */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Statistiques
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Propriétés actives</span>
                      <span className="font-semibold">{agency.properties}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</span>
                      <span className="font-semibold">{safeRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Certifiée</span>
                      <span className="font-semibold">
                        {agency.verified ? (
                          <Badge variant="default" className="bg-green-500">Oui</Badge>
                        ) : (
                          <Badge variant="outline">Non</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Properties Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nos propriétés</h2>
              <span className="text-gray-600 dark:text-gray-400">
                {properties.length} propriété{properties.length > 1 ? 's' : ''} disponible{properties.length > 1 ? 's' : ''}
              </span>
            </div>

            {isLoadingProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <AnimatedCard key={i} className="h-64">
                    <div className="animate-pulse h-full bg-muted/50 rounded-lg"></div>
                  </AnimatedCard>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <AnimatedCard className="p-8 text-center">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune propriété disponible</h3>
                <p className="text-muted-foreground">
                  Cette agence n'a pas encore publié de propriétés.
                </p>
              </AnimatedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    isPublicView={true}
                    showFavorite={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Service Areas */}
          {agency.serviceAreas && agency.serviceAreas.length > 0 && (
            <AnimatedCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Zones d'intervention</h3>
              <div className="flex flex-wrap gap-2">
                {agency.serviceAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {area}
                  </Badge>
                ))}
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
      <Footer />
    </PublicPageWrapper>
  );
}
