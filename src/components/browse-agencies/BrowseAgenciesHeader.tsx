import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import UpgradeButton from '@/components/subscription/UpgradeButton';
import { useUserSubscription } from '@/hooks/useUserSubscription';

interface BrowseAgenciesHeaderProps {
  user: any;
  canCreateAgency: boolean;
}

export const BrowseAgenciesHeader: React.FC<BrowseAgenciesHeaderProps> = ({ user, canCreateAgency }) => {
  const { isFreePlan } = useUserSubscription();
  
  return (
    <div className="relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-immoo-navy/5 via-immoo-gold/5 to-immoo-pearl/5 rounded-2xl" />
      
      <div className="relative px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Title Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-12 bg-gradient-to-b from-immoo-gold to-immoo-navy rounded-full" />
              <div>
                <h1 className="text-4xl font-bold text-immoo-navy leading-tight">
                  Agences Immobilières
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Découvrez les meilleures agences immobilières de votre région
                </p>
              </div>
            </div>
            
            {/* Stats Badge */}
            <div className="flex items-center gap-4 mt-4">
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-600">
                  <Search className="w-4 h-4 inline mr-2" />
                  Explorez nos partenaires certifiés
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button 
              asChild
              variant="outline"
              className="border-immoo-gold text-immoo-gold hover:bg-immoo-gold hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 font-medium"
            >
              <Link to="/agencies/all" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrer les agences
              </Link>
            </Button>
            
            {user && isFreePlan() && (
              <UpgradeButton 
                planName="Premium"
                variant="outline"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5"
              />
            )}
            
            {user && (
              <Button 
                asChild={canCreateAgency}
                disabled={!canCreateAgency}
                className="bg-immoo-gold hover:bg-immoo-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 font-medium"
              >
                {canCreateAgency ? (
                  <Link to="/create-agency" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une agence
                  </Link>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une agence
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
