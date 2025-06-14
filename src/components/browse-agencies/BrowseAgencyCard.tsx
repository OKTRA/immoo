
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Star, Phone, Mail, Globe, BadgeCheck } from "lucide-react";
import { Agency } from "@/assets/types";

interface BrowseAgencyCardProps {
  agency: Agency;
  onAgencyClick: (agencyId: string) => void;
}

export default function BrowseAgencyCard({ agency, onAgencyClick }: BrowseAgencyCardProps) {
  // Ensure rating is a number with proper fallback
  const safeRating = typeof agency.rating === 'number' ? agency.rating : 0;
  
  return (
    <AnimatedCard className="p-6 hover:shadow-xl transition-all duration-300 group">
      {/* Agency Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-background">
            {agency.logoUrl ? (
              <img 
                src={agency.logoUrl} 
                alt={agency.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <Building className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          {agency.verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {agency.name}
          </h3>
          {agency.location && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm truncate">{agency.location}</span>
            </div>
          )}
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">{safeRating.toFixed(1)}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {agency.properties} propriété{agency.properties > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {agency.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {agency.description}
        </p>
      )}

      {/* Specialties */}
      {agency.specialties && agency.specialties.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {agency.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {agency.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agency.specialties.length - 3} autres
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Contact Information - Maintenant masqué */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
          <Phone className="h-4 w-4 mr-2" />
          <span>Informations disponibles après contact</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
          <Mail className="h-4 w-4 mr-2" />
          <span>Email disponible après contact</span>
        </div>
        {agency.website && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Globe className="h-4 w-4 mr-2" />
            <span className="truncate">{agency.website}</span>
          </div>
        )}
      </div>

      {/* Action Button - Navigation directe vers la page publique */}
      <div className="mt-auto">
        <Button 
          onClick={() => onAgencyClick(agency.id)}
          className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-200"
        >
          Découvrir cette agence
        </Button>
      </div>
    </AnimatedCard>
  );
}
