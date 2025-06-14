
import { useQuery } from "@tanstack/react-query";
import { getUserAgencies } from "@/services/agency";
import AgencyCard from "@/components/AgencyCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function AgenciesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-agencies'],
    queryFn: () => getUserAgencies(),
  });

  const agencies = data?.agencies || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/50 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p className="text-muted-foreground mb-4">
            Impossible de charger vos agences
          </p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Agences</h1>
        <Button asChild>
          <Link to="/agencies/create">
            <Plus className="w-4 h-4 mr-2" />
            Créer une agence
          </Link>
        </Button>
      </div>

      {agencies.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">Aucune agence trouvée</h3>
          <p className="text-muted-foreground mb-6">
            Commencez par créer votre première agence
          </p>
          <Button asChild>
            <Link to="/agencies/create">
              <Plus className="w-4 h-4 mr-2" />
              Créer une agence
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <AgencyCard 
              key={agency.id} 
              agency={agency} 
              onDelete={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
