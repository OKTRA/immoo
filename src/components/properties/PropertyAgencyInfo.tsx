
import React from 'react';
import { Property } from "@/assets/types";
import { Building, Phone, Mail, Globe, MapPin, ShieldCheck, Star, Users, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from '@/hooks/useTranslation';

interface PropertyAgencyInfoProps {
  property: Property;
}

export default function PropertyAgencyInfo({ property }: PropertyAgencyInfoProps) {
  const { t } = useTranslation();
  const safeRating = typeof property.agencyRating === 'number' ? property.agencyRating : 0;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-xl p-4 sm:p-6 border">
      <h3 className="font-semibold text-lg mb-6 flex items-center">
        <Building className="h-5 w-5 mr-2 text-primary" />
        {t('propertyDetails.agency.title')}
      </h3>
      
      <div className="space-y-6">
        {/* En-tête de l'agence avec logo et nom */}
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Logo de l'agence */}
          <div className="flex-shrink-0">
            {property.agencyLogo ? (
              <img 
                src={property.agencyLogo} 
                alt="Logo agence" 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg border bg-white"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-lg">
                <Building className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h4 className="font-semibold text-xl">{property.agencyName || t('propertyDetails.agency.realEstateAgency')}</h4>
              {property.agencyVerified && (
                <ShieldCheck className="h-5 w-5 ml-2 text-green-500" />
              )}
            </div>
            
            {/* Localisation - utilise la vraie localisation de la propriété */}
            {property.location && (
              <div className="flex items-center mb-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property.location}</span>
              </div>
            )}

            {/* Note et statut */}
            <div className="flex items-center space-x-4 mb-3">
              {safeRating > 0 && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{safeRating.toFixed(1)}/5</span>
                </div>
              )}
              {property.agencyVerified && (
                <Badge variant="default" className="bg-green-500">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {t('propertyDetails.agency.certified')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description de l'agence */}
        {property.agencyDescription && (
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
            <h5 className="font-medium mb-2 flex items-center">
              <Award className="h-4 w-4 mr-2 text-primary" />
              {t('propertyDetails.agency.aboutAgency')}
            </h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {property.agencyDescription}
            </p>
          </div>
        )}

        {/* Spécialités */}
        {property.agencySpecialties && property.agencySpecialties.length > 0 && (
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
            <h5 className="font-medium mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              {t('propertyDetails.agency.specialties')}
            </h5>
            <div className="flex flex-wrap gap-2">
              {property.agencySpecialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Zones de service */}
        {property.agencyServiceAreas && property.agencyServiceAreas.length > 0 && (
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
            <h5 className="font-medium mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {t('propertyDetails.agency.serviceAreas')}
            </h5>
            <div className="flex flex-wrap gap-2">
              {property.agencyServiceAreas.map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
          <h5 className="font-medium mb-3 flex items-center">
            <Phone className="h-4 w-4 mr-2 text-primary" />
            {t('propertyDetails.agency.contact')}
          </h5>
          <div className="grid grid-cols-1 gap-3">
            {property.agencyPhone && (
              <a 
                href={`tel:${property.agencyPhone}`} 
                className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-700/40 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors"
              >
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{property.agencyPhone}</span>
              </a>
            )}
            
            {property.agencyEmail && (
              <a 
                href={`mailto:${property.agencyEmail}`} 
                className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-700/40 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors"
              >
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{property.agencyEmail}</span>
              </a>
            )}
            
            {property.agencyWebsite && (
              <a 
                href={property.agencyWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-700/40 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors"
              >
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{t('propertyDetails.agency.visitWebsite')}</span>
              </a>
            )}
          </div>
        </div>

        {/* Statistiques de l'agence */}
        <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
          <h5 className="font-medium mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2 text-primary" />
            {t('propertyDetails.agency.statistics')}
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {property.agencyPropertiesCount && (
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{property.agencyPropertiesCount}</div>
                <div className="text-xs text-muted-foreground">{t('propertyDetails.agency.properties')}</div>
              </div>
            )}
            {safeRating > 0 && (
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{safeRating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{t('propertyDetails.agency.averageRating')}</div>
              </div>
            )}
            {property.agencyYearsActive && (
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{property.agencyYearsActive}</div>
                <div className="text-xs text-muted-foreground">{t('propertyDetails.agency.yearsExperience')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Date de création/adhésion */}
        {property.agencyJoinDate && (
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {t('propertyDetails.agency.memberSince')}: 
                <span className="font-medium ml-1">
                  {new Date(property.agencyJoinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
