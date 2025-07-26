import { useQuery } from "@tanstack/react-query";
import { getUserAgencies } from "@/services/agency";
import AgencyCard from "@/components/AgencyCard";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, useAuthStatus } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AgenciesPage() {
  const { user, profile, initialized } = useAuth();
  const { isAuthenticated, isReady } = useAuthStatus();
  const [forceLoad, setForceLoad] = useState(false);
  const navigate = useNavigate();
  
  // Debug logs pour identifier le problème
  useEffect(() => {
    console.log('🔍 AgenciesPage Debug:', {
      user: !!user,
      userId: user?.id,
      isReady,
      isAuthenticated,
      initialized,
      forceLoad
    });
  }, [user, isReady, isAuthenticated, initialized, forceLoad]);

  // Forcer le chargement après 3 secondes si l'auth ne se charge pas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialized && !forceLoad) {
        console.log('⚠️ Forcing load after timeout');
        setForceLoad(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [initialized, forceLoad]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-agencies', user?.id],
    queryFn: async () => {
      console.log('🔍 Fetching user agencies for user:', user?.id);
      const result = await getUserAgencies();
      
      // Si aucune agence trouvée et que l'utilisateur est une agence, 
      // essayer de corriger automatiquement
      if ((!result.agencies || result.agencies.length === 0) && user?.user_metadata?.role === 'agency') {
        console.log('Aucune agence trouvée, tentative de correction automatique...');
        
        // Importer le service de correction
        const { AutoFixAgencyLinksService } = await import('@/services/agency/autoFixAgencyLinks');
        const fixResult = await AutoFixAgencyLinksService.fixUserAgencyLink(user.id);
        
        if (fixResult.success) {
          console.log('Correction automatique réussie:', fixResult.message);
          // Récupérer à nouveau les agences après correction
          return getUserAgencies();
        }
      }
      
      return result;
    },
    // Permettre le chargement si l'utilisateur est présent OU si on force le chargement
    enabled: (!!user?.id && initialized) || forceLoad,
    // Ajouter des options pour améliorer la fiabilité
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const agencies = data?.agencies || [];

  const handleCreateAgency = () => {
    navigate('/agencies/create');
  };

  // Afficher un loading pendant que l'auth se charge
  if (!initialized) {
    console.log('🔍 Showing loading state - initialized:', initialized);
    return (
      <ResponsiveLayout>
        <div className="bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-muted/50 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (isLoading) {
    console.log('🔍 Query is loading...');
    return (
      <ResponsiveLayout>
        <div className="bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-muted/50 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    console.error('🔍 Query error:', error);
    return (
      <ResponsiveLayout>
        <div className="bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erreur</h2>
            <p className="text-muted-foreground mb-4">
              Impossible de charger vos agences
            </p>
            <div className="space-y-2">
              <Button onClick={() => refetch()}>Réessayer</Button>
              <div className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Erreur inconnue'}
              </div>
            </div>
          </div>
        </div>
        </div>
      </ResponsiveLayout>
    );
  }

  console.log('🔍 Rendering agencies page with', agencies.length, 'agencies');

  return (
    <ResponsiveLayout>
      <div className="bg-gradient-to-br from-immoo-pearl/20 via-white to-immoo-pearl/10 dark:from-immoo-navy/50 dark:via-immoo-navy-light/30 dark:to-immoo-navy/50 min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-immoo-gold/10 text-immoo-navy dark:text-immoo-pearl border border-immoo-gold/20 mb-4">
              <Building2 className="mr-2 h-4 w-4" />
              Gestion d'Agences
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-immoo-navy dark:text-immoo-pearl mb-4">
              Mes Agences
            </h1>
            <p className="text-lg text-immoo-navy/70 dark:text-immoo-pearl/70 max-w-2xl mx-auto">
              Gérez vos agences immobilières et optimisez votre activité
            </p>
          </motion.div>

          {/* Create Agency Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <Button
              onClick={handleCreateAgency}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Agence
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Agencies Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {agencies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-immoo-gold/20 to-immoo-gold-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-12 w-12 text-immoo-gold" />
              </div>
              <h3 className="text-xl font-semibold text-immoo-navy dark:text-immoo-pearl mb-2">
                Aucune agence trouvée
              </h3>
              <p className="text-immoo-navy/70 dark:text-immoo-pearl/70 mb-6 max-w-md mx-auto">
                Commencez par créer votre première agence pour gérer vos biens immobiliers
              </p>
              <Button
                onClick={handleCreateAgency}
                className="bg-gradient-to-r from-immoo-gold to-immoo-gold-light hover:from-immoo-gold-light hover:to-immoo-gold text-immoo-navy px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer ma première agence
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {agencies.map((agency, index) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <AgencyCard 
                    agency={agency} 
                    onDelete={() => refetch()}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      </div>
    </ResponsiveLayout>
  );
}
