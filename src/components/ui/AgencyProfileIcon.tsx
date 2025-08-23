import React from 'react';
import { Building2, User, Crown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyProfileIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
  isPremium?: boolean;
}

export default function AgencyProfileIcon({ 
  size = 'md', 
  className,
  showBadge = true,
  isPremium = false
}: AgencyProfileIconProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn(
      'relative group cursor-pointer transition-all duration-300 hover:scale-110',
      className
    )}>
      {/* Icône principale avec gradient et ombre */}
      <div className={cn(
        'relative rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        'border-2 border-white/20 hover:border-white/40',
        'flex items-center justify-center',
        sizeClasses[size]
      )}>
        {/* Icône Building2 au centre */}
        <Building2 
          className={cn(
            'text-white drop-shadow-sm',
            iconSizes[size]
          )} 
        />
        
        {/* Effet de brillance */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Bordure animée */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Badge premium avec couronne */}
      {showBadge && isPremium && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 shadow-lg border-2 border-white">
          <Crown className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Badge de statut agence */}
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-1 shadow-lg border-2 border-white">
          <Shield className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Indicateur de connexion */}
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />

      {/* Tooltip au survol */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        <div className="flex items-center gap-2">
          <Building2 className="h-3 w-3" />
          <span>Mon Espace Agence</span>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

// Variante compacte pour les boutons
export function AgencyProfileIconCompact({ 
  size = 'sm',
  className,
  showBadge = false,
  isPremium = false
}: AgencyProfileIconProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn(
      'relative group cursor-pointer transition-all duration-200 hover:scale-105',
      className
    )}>
      {/* Icône principale simplifiée */}
      <div className={cn(
        'relative rounded-full bg-gradient-to-br from-blue-600 to-indigo-700',
        'shadow-md hover:shadow-lg transition-all duration-200',
        'border border-white/30 hover:border-white/50',
        'flex items-center justify-center',
        sizeClasses[size]
      )}>
        <Building2 
          className={cn(
            'text-white',
            iconSizes[size]
          )} 
        />
        
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Badge premium compact */}
      {showBadge && isPremium && (
        <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5 shadow-md border border-white">
          <Crown className="h-2.5 w-2.5 text-white" />
        </div>
      )}

      {/* Badge de statut compact */}
      {showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-0.5 shadow-md border border-white">
          <Shield className="h-2.5 w-2.5 text-white" />
        </div>
      )}

      {/* Indicateur de connexion compact */}
      <div className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white shadow-sm" />
    </div>
  );
}
