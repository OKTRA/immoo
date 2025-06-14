
import React from 'react';
import { Property } from "@/assets/types";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PropertyDetailsHeaderProps {
  property: Property;
  getPaymentFrequencyLabel: (frequency: string) => string;
}

export default function PropertyDetailsHeader({ property, getPaymentFrequencyLabel }: PropertyDetailsHeaderProps) {
  return (
    <div className="relative">
      {/* Image de la propriété */}
      <div className="h-48 sm:h-64 md:h-80 relative overflow-hidden">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
            <Home className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
        {/* Overlay avec badge de statut */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4">
          <Badge 
            variant={
              property.status === "available" ? "default" :
              property.status === "sold" ? "destructive" :
              "secondary"
            }
            className="text-sm font-medium"
          >
            {property.status === "available" ? "Disponible" :
             property.status === "sold" ? "Vendu" :
             property.status === "pending" ? "En attente" :
             property.status}
          </Badge>
        </div>
      </div>

      {/* Titre et prix overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
          {property.title}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center text-white/90">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{property.location}</span>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(property.price, "FCFA")}
            </div>
            {property.paymentFrequency && (
              <div className="text-xs sm:text-sm text-white/80">
                / {getPaymentFrequencyLabel(property.paymentFrequency)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
