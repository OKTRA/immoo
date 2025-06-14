
import React from 'react';
import { Property } from "@/assets/types";
import { Building, Phone, Mail, Globe, MapPin, ShieldCheck } from "lucide-react";

interface PropertyAgencyInfoProps {
  property: Property;
}

export default function PropertyAgencyInfo({ property }: PropertyAgencyInfoProps) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-xl p-4 sm:p-6 border">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <Building className="h-5 w-5 mr-2 text-primary" />
        Informations sur l'agence
      </h3>
      
      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Logo de l'agence */}
        <div className="flex-shrink-0">
          {property.agencyLogo ? (
            <img 
              src={property.agencyLogo} 
              alt="Logo agence" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border bg-white"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-lg">
              <Building className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          )}
        </div>

        {/* Informations de l'agence */}
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <h4 className="font-semibold text-lg">{property.agencyName || "Agence immobilière"}</h4>
            {property.agencyVerified && (
              <ShieldCheck className="h-5 w-5 ml-2 text-green-500" />
            )}
          </div>
          
          {/* Informations de contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {property.agencyPhone && (
              <a 
                href={`tel:${property.agencyPhone}`} 
                className="flex items-center space-x-2 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/60 transition-colors"
              >
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{property.agencyPhone}</span>
              </a>
            )}
            
            {property.agencyEmail && (
              <a 
                href={`mailto:${property.agencyEmail}`} 
                className="flex items-center space-x-2 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/60 transition-colors"
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
                className="flex items-center space-x-2 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/60 transition-colors sm:col-span-2"
              >
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Visiter le site web</span>
              </a>
            )}
          </div>

          {/* Pays et localisation */}
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">
                <span className="font-medium">{property.location}</span>
                <span className="text-muted-foreground ml-2">• Burkina Faso 🇧🇫</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
