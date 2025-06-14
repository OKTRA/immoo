
import React from 'react';
import { Property } from "@/assets/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, MapPin, Ruler, Hotel, Bath, Tag, Calendar, CreditCard, Phone, Mail, Globe, 
  ShieldCheck, Euro, Receipt, PiggyBank, Building, User, Clock, CheckCircle,
  Car, Wifi, Droplets, Zap, Shield, Mountain
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PropertyDetailsDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsDialog({ property, isOpen, onClose }: PropertyDetailsDialogProps) {
  if (!property) return null;

  const getPaymentFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      daily: "Journalier",
      weekly: "Hebdomadaire", 
      monthly: "Mensuel",
      quarterly: "Trimestriel",
      biannual: "Semestriel",
      annual: "Annuel"
    };
    return labels[frequency] || "Mensuel";
  };

  const getFeatureIcon = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('parking') || featureLower.includes('garage')) return <Car className="h-4 w-4" />;
    if (featureLower.includes('wifi') || featureLower.includes('internet')) return <Wifi className="h-4 w-4" />;
    if (featureLower.includes('piscine') || featureLower.includes('pool')) return <Droplets className="h-4 w-4" />;
    if (featureLower.includes('électricité') || featureLower.includes('electric')) return <Zap className="h-4 w-4" />;
    if (featureLower.includes('sécurité') || featureLower.includes('security')) return <Shield className="h-4 w-4" />;
    if (featureLower.includes('jardin') || featureLower.includes('garden')) return <Mountain className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[850px] max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header avec image et titre */}
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

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Caractéristiques principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <Ruler className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground mb-1">Surface</p>
                <p className="font-bold text-lg">{property.area} m²</p>
              </div>
              
              {property.bedrooms > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center">
                  <Hotel className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-muted-foreground mb-1">Chambres</p>
                  <p className="font-bold text-lg">{property.bedrooms}</p>
                </div>
              )}
              
              {property.bathrooms > 0 && (
                <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-xl p-4 text-center">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
                  <p className="text-xs text-muted-foreground mb-1">Salles de bain</p>
                  <p className="font-bold text-lg">{property.bathrooms}</p>
                </div>
              )}
              
              {property.type && (
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 text-center">
                  <Tag className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-bold text-sm">{property.type}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-muted/30 rounded-xl p-4 sm:p-6">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Informations financières */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Euro className="h-5 w-5 mr-2 text-green-600" />
                Informations financières
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Loyer */}
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 mr-2 text-green-600" />
                    <h4 className="font-medium">Loyer {property.paymentFrequency ? getPaymentFrequencyLabel(property.paymentFrequency).toLowerCase() : 'mensuel'}</h4>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(property.price, "FCFA")}
                  </p>
                </div>

                {/* Dépôt de garantie */}
                {property.securityDeposit && (
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="font-medium">Caution / Dépôt de garantie</h4>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(property.securityDeposit, "FCFA")}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Frais d'agence */}
                {property.agencyFees && (
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Building className="h-5 w-5 mr-2 text-orange-600" />
                      <h4 className="font-medium">Frais d'agence</h4>
                    </div>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(property.agencyFees, "FCFA")}
                    </p>
                  </div>
                )}

                {/* Taux de commission */}
                {property.commissionRate && (
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Tag className="h-5 w-5 mr-2 text-purple-600" />
                      <h4 className="font-medium">Commission</h4>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {property.commissionRate}%
                    </p>
                  </div>
                )}
              </div>

              {/* Coût total initial */}
              {(property.securityDeposit || property.agencyFees) && (
                <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200">
                    💰 Coût total à prévoir
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Loyer ({getPaymentFrequencyLabel(property.paymentFrequency || 'monthly').toLowerCase()})</span>
                      <span className="font-medium">{formatCurrency(property.price, "FCFA")}</span>
                    </div>
                    {property.securityDeposit && (
                      <div className="flex justify-between">
                        <span>Caution</span>
                        <span className="font-medium">{formatCurrency(property.securityDeposit, "FCFA")}</span>
                      </div>
                    )}
                    {property.agencyFees && (
                      <div className="flex justify-between">
                        <span>Frais d'agence</span>
                        <span className="font-medium">{formatCurrency(property.agencyFees, "FCFA")}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base text-green-800 dark:text-green-200">
                      <span>Total initial</span>
                      <span>
                        {formatCurrency(
                          property.price + 
                          (property.securityDeposit || 0) + 
                          (property.agencyFees || 0), 
                          "FCFA"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Caractéristiques et équipements */}
            {property.features && property.features.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 sm:p-6">
                <h3 className="font-semibold text-lg mb-4">✨ Caractéristiques et équipements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/40 rounded-lg p-3">
                      {getFeatureIcon(feature)}
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations sur l'agence */}
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
          </div>

          {/* Footer avec bouton de fermeture */}
          <div className="border-t bg-background p-4 sm:p-6">
            <Button onClick={onClose} className="w-full text-base py-3">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
