
import { Building } from "lucide-react";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import BrowseAgencyCard from "./BrowseAgencyCard";
import { Agency } from "@/assets/types";

interface AgenciesGridProps {
  agencies: Agency[];
  isLoading: boolean;
  error: any;
  rawAgencies: any[];
  onAgencyClick: (agencyId: string) => void;
}

export default function AgenciesGrid({ 
  agencies, 
  isLoading, 
  error, 
  rawAgencies, 
  onAgencyClick 
}: AgenciesGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <AnimatedCard key={i} className="p-6 h-96">
            <div className="animate-pulse flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-muted/50 rounded w-full"></div>
                <div className="h-4 bg-muted/50 rounded w-2/3"></div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Impossible de charger les agences</h3>
        <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
        <p className="text-sm text-red-500 mt-2">Erreur: {String(error)}</p>
      </div>
    );
  }

  if (agencies.length === 0) {
    return (
      <div className="text-center py-16">
        <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Aucune agence trouvée</h3>
        <p className="text-muted-foreground">
          {rawAgencies.length === 0 
            ? "Aucune agence n'est disponible pour le moment"
            : "Essayez de modifier vos critères de recherche"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {agencies.map((agency: Agency) => (
        <BrowseAgencyCard 
          key={agency.id} 
          agency={agency} 
          onAgencyClick={onAgencyClick}
        />
      ))}
    </div>
  );
}
