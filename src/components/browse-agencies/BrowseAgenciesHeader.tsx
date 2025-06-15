
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UpgradeButton from '@/components/subscription/UpgradeButton';
import { useUserSubscription } from '@/hooks/useUserSubscription';

interface BrowseAgenciesHeaderProps {
  user: any;
  canCreateAgency: boolean;
}

export const BrowseAgenciesHeader: React.FC<BrowseAgenciesHeaderProps> = ({ user, canCreateAgency }) => {
  const { isFreePlan } = useUserSubscription();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">Agences Immobilières</h1>
        <p className="text-muted-foreground">
          Découvrez les meilleures agences immobilières de votre région
        </p>
      </div>
      
      <div className="flex gap-3">
        {user && isFreePlan() && (
          <UpgradeButton 
            planName="Premium"
            variant="outline"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
          />
        )}
        
        {user && (
          <Button 
            asChild={canCreateAgency}
            disabled={!canCreateAgency}
            className="flex items-center gap-2"
          >
            {canCreateAgency ? (
              <Link to="/create-agency">
                <Plus className="h-4 w-4" />
                Créer une agence
              </Link>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Créer une agence
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
