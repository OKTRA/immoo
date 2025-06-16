import { useQuery } from "@tanstack/react-query";
import { getUserAgencies } from "@/services/agency";
import AgencyCard from "@/components/AgencyCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import UpgradeButton from "@/components/subscription/UpgradeButton";
import LimitWarning from "@/components/subscription/LimitWarning";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AgenciesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { subscription, checkLimit, isFreePlan, loading: subscriptionLoading, reloadSubscription } = useUserSubscription();
  const [agencyLimit, setAgencyLimit] = useState<any>(null);
  const navigate = useNavigate();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-agencies', user?.id],
    queryFn: () => getUserAgencies(),
    enabled: !!user && !authLoading,
  });

  const agencies = data?.agencies || [];

  // Charger l'abonnement au montage du composant
  useEffect(() => {
    if (user?.id && !subscriptionLoading && !subscription) {
      reloadSubscription();
    }
  }, [user?.id, subscriptionLoading, subscription, reloadSubscription]);

  // Vérifier les limites dès que l'abonnement est chargé
  useEffect(() => {
    const checkAgencyLimits = async () => {
      if (user?.id && subscription) {
        const limit = await checkLimit('agencies');
        setAgencyLimit(limit);
      }
    };

    if (!subscriptionLoading) {
      checkAgencyLimits();
    }
  }, [user?.id, subscription, checkLimit, subscriptionLoading]);

  const handleCreateAgency = () => {
    if (agencyLimit && !agencyLimit.allowed) {
      return;
    }
    navigate('/agencies/create');
  };

  // Afficher un loading pendant que l'auth se charge
  if (authLoading || subscriptionLoading) {
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

  const canCreateAgency = agencyLimit ? agencyLimit.allowed : true; // Default to true if no limit check yet

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Agences</h1>
          <p className="text-muted-foreground">
            {subscription?.plan ? `Plan ${subscription.plan.name}` : 'Plan gratuit'}
            {agencyLimit && (
              <span className="ml-2">
                - {agencyLimit.currentCount}/{agencyLimit.maxAllowed} agences utilisées
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isFreePlan() && <UpgradeButton />}
          <Button 
            onClick={handleCreateAgency}
            disabled={!canCreateAgency}
            className={!canCreateAgency ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une agence
          </Button>
        </div>
      </div>

      {/* Alerte de limite */}
      {agencyLimit && !agencyLimit.allowed && (
        <div className="mb-6">
          <LimitWarning
            resourceType="agencies"
            currentCount={agencyLimit.currentCount}
            maxAllowed={agencyLimit.maxAllowed}
            onUpgrade={() => navigate('/pricing')}
          />
        </div>
      )}

      {/* Information sur les limitations - Affichage corrigé */}
      {subscription?.plan && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">Limitations de votre plan {subscription.plan.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Agences:</span>
              <span className="ml-2 font-medium">
                {agencyLimit ? `${agencyLimit.currentCount}/${agencyLimit.maxAllowed}` : `${agencies.length}/${subscription.plan.maxAgencies || 1}`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Propriétés:</span>
              <span className="ml-2 font-medium">{subscription.plan.maxProperties || 1}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Baux:</span>
              <span className="ml-2 font-medium">{subscription.plan.maxLeases || 1}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Utilisateurs:</span>
              <span className="ml-2 font-medium">{subscription.plan.maxUsers || 1}</span>
            </div>
          </div>
          
          {/* Debug info en mode développement */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info (Dev only)</summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify({
                  subscription: subscription,
                  agencyLimit: agencyLimit,
                  agenciesCount: agencies.length,
                  isFreePlan: isFreePlan()
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {agencies.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">Aucune agence trouvée</h3>
          <p className="text-muted-foreground mb-6">
            Commencez par créer votre première agence
          </p>
          {canCreateAgency ? (
            <Button onClick={handleCreateAgency}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une agence
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-red-600 dark:text-red-400">
                Vous avez atteint la limite de votre plan gratuit
              </p>
              <UpgradeButton />
            </div>
          )}
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
