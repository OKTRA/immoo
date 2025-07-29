import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPropertyById } from '@/services/property';
import { getAgencyById } from '@/services/agency';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MapPin, 
  Ruler, 
  Hotel, 
  Bath, 
  Tag, 
  Phone, 
  Mail, 
  Globe,
  Heart,
  Building2,
  Home,
  Share2,
  Calendar,
  Building,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import PropertyImageGallery from '@/components/properties/PropertyImageGallery';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PublicPropertyPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  // Fetch property data
  const { data: propertyResult, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  // Fetch agency data if property is loaded
  const { data: agencyResult, isLoading: agencyLoading } = useQuery({
    queryKey: ['agency', propertyResult?.property?.agencyId],
    queryFn: () => getAgencyById(propertyResult!.property!.agencyId),
    enabled: !!propertyResult?.property?.agencyId,
  });

  if (propertyLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-gold/5 dark:from-immoo-navy dark:via-immoo-navy-light/50 dark:to-immoo-navy">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Loading Skeleton */}
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (propertyError || !propertyResult?.property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-gold/5 dark:from-immoo-navy dark:via-immoo-navy-light/50 dark:to-immoo-navy flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 mb-6">
              <Building className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Propriété introuvable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Cette propriété n'existe pas ou n'est plus disponible.
            </p>
            <Button onClick={() => navigate('/')} className="bg-immoo-gold hover:bg-immoo-gold/90 text-immoo-navy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const property = propertyResult.property;
  const agency = agencyResult?.agency;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Découvrez cette propriété: ${property.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically save to favorites
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-white to-immoo-gold/5 dark:from-immoo-navy dark:via-immoo-navy-light/50 dark:to-immoo-navy">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Back Button to agency public page */}
            {property && (
              <Button 
                variant="ghost" 
                onClick={() => navigate(property.agencyId ? `/agencies/${property.agencyId}` : '/')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-immoo-gold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {property.agencyId ? "Retour à l'agence" : "Retour à l'accueil"}
              </Button>
            )}

            {/* Property Images */}
            <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 overflow-hidden h-96 sm:h-[500px]">
              <PropertyImageGallery 
                propertyId={property.id}
                mainImageUrl={property.imageUrl}
                images={property.images || []}
                showControls={true}
                showThumbnails={false}
                className="h-full"
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Property Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and Price */}
                <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                        {property.title}
                      </h1>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                        <MapPin className="h-5 w-5 mr-2 text-immoo-gold" />
                        <span className="text-base sm:text-lg">{property.address || property.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFavorite}
                        className={`rounded-full ${isFavorite ? 'text-red-500 border-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                        className="rounded-full"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl sm:text-4xl font-bold text-immoo-gold mb-2">
                      {formatCurrency(property.price)}
                      <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                        / mois
                      </span>
                    </div>
                    {property.charges && (
                      <p className="text-gray-600 dark:text-gray-400">
                        + {formatCurrency(property.charges)} de charges
                      </p>
                    )}
                  </div>

                  {/* Property Features */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                      <Ruler className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {property.surface || property.area} m²
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Surface</div>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                      <Hotel className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {property.rooms || property.bedrooms}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pièces</div>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                      <Bath className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {property.bathrooms}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Salles de bain</div>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
                      <Tag className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {property.type}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                    </div>
                  </div>

                  {/* Property Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-5 w-5 mr-2 text-immoo-gold" />
                      <span>Mise en ligne : {property.createdAt ? new Date(property.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}</span>
                    </div>
                    {property.updatedAt && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-5 w-5 mr-2 text-immoo-gold" />
                        <span>MAJ : {new Date(property.updatedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Property Status */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${
                      property.status === 'available' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : property.status === 'rented'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white`}>
                      {t(`propertyDetails.status.${property.status}`) || property.status}
                    </Badge>
                    {property.furnished && (
                      <Badge variant="secondary">{t('property.furnished')}</Badge>
                    )}
                  </div>
                </div>

                {/* Additional Property Details */}
                <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-immoo-navy dark:text-immoo-pearl mb-6">
                    Détails de la propriété
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.livingRooms && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Salons</span>
                        <span className="font-medium text-gray-900 dark:text-white">{property.livingRooms}</span>
                      </div>
                    )}
                    {property.kitchens && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Cuisines</span>
                        <span className="font-medium text-gray-900 dark:text-white">{property.kitchens}</span>
                      </div>
                    )}
                    {property.yearBuilt && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Année de construction</span>
                        <span className="font-medium text-gray-900 dark:text-white">{property.yearBuilt}</span>
                      </div>
                    )}
                    {property.securityDeposit && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Dépôt de garantie</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(property.securityDeposit)}</span>
                      </div>
                    )}
                    {property.agencyFees && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Frais d'agence</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(property.agencyFees)}</span>
                      </div>
                    )}

                  </div>
                  
                  {/* Features */}
                  {property.features && property.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl mb-3">
                        Équipements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-immoo-gold/10 text-immoo-navy dark:bg-immoo-gold/20 dark:text-immoo-pearl">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
                      Description
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Agency Contact Card */}
              <div className="space-y-6">
                {agency && (
                  <div className="bg-white/80 dark:bg-immoo-navy-light/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-immoo-gold/10 p-6 sm:p-8">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 ring-4 ring-white/50 dark:ring-immoo-gold/20">
                        {agency.logoUrl ? (
                          <img 
                            src={agency.logoUrl} 
                            alt={agency.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-immoo-gold to-immoo-navy">
                            <Building className="w-10 h-10 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl mb-2">
                        {agency.name}
                      </h3>
                      {agency.verified && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Agence certifiée
                        </Badge>
                      )}
                    </div>

                    {/* Contact Actions */}
                    <div className="space-y-3">
                      {agency.phone && (
                        <a 
                          href={`tel:${agency.phone}`}
                          className="flex items-center justify-center w-full p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Appeler
                        </a>
                      )}
                      
                      {agency.email && (
                        <a 
                          href={`mailto:${agency.email}?subject=Demande d'information - ${property.title}`}
                          className="flex items-center justify-center w-full p-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Mail className="w-5 h-5 mr-2" />
                          Envoyer un email
                        </a>
                      )}

                      {agency.website && (
                        <a 
                          href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Globe className="w-5 h-5 mr-2" />
                          Visiter le site web
                        </a>
                      )}
                      
                      {/* Bouton pour voir toutes les propriétés de l'agence */}
                      <Button 
                        onClick={() => navigate(`/public-agency/${agency.id}`)}
                        className="flex items-center justify-center w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Building2 className="w-5 h-5 mr-2" />
                        Voir toutes les propriétés
                      </Button>
                      
                      {/* Bouton pour retourner à l'accueil */}
                      <Button 
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center w-full p-4 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Home className="w-5 h-5 mr-2" />
                        Retour à l'accueil
                      </Button>
                    </div>

                    {/* Agency Description */}
                    {(property.agencyDescription || agency.description) && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {property.agencyDescription || agency.description}
                        </p>
                      </div>
                    )}

                    {/* Agency Specialties */}
                    {(property.agencySpecialties || agency.specialties) && (property.agencySpecialties || agency.specialties).length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                          Spécialités
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {(property.agencySpecialties || agency.specialties).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Agency Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-immoo-navy dark:text-immoo-pearl">
                            {property.agencyPropertiesCount || agency.properties || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Propriétés
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-immoo-navy dark:text-immoo-pearl">
                            {property.agencyRating ? property.agencyRating.toFixed(1) : (agency.rating ? agency.rating.toFixed(1) : '0.0')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Note
                          </div>
                        </div>
                      </div>
                      
                      {/* Years Active */}
                      {property.agencyYearsActive && (
                        <div className="mt-4 text-center">
                          <div className="text-lg font-semibold text-immoo-navy dark:text-immoo-pearl">
                            {property.agencyYearsActive} {property.agencyYearsActive > 1 ? 'ans' : 'an'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            d'expérience
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
