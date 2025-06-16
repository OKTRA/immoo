
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

interface NoAgenciesFoundProps {
  searchTerm: string;
  user: any;
  canCreateAgency: boolean;
}

export const NoAgenciesFound: React.FC<NoAgenciesFoundProps> = ({ searchTerm, user, canCreateAgency }) => {
  return (
    <div className="text-center py-12">
      <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Aucune agence trouvée</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm ? 'Aucune agence ne correspond à votre recherche.' : 'Aucune agence disponible pour le moment.'}
      </p>
      {user && canCreateAgency && (
        <Button asChild>
          <Link to="/create-agency">
            <Plus className="h-4 w-4 mr-2" />
            Créer la première agence
          </Link>
        </Button>
      )}
    </div>
  );
};
