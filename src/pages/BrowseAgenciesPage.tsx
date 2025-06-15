
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Star, Users, Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { getAgenciesWithSubscriptions } from '@/services/userSubscriptionService';
import UpgradeButton from '@/components/subscription/UpgradeButton';
import LimitWarning from '@/components/subscription/LimitWarning';
import { toast } from 'sonner';

interface AgencyWithSubscription {
  id: string;
  name: string;
  logoUrl?: string;
  subscription?: {
    plan?: {
      name: string;
      price: number;
    };
  };
}

export default function BrowseAgenciesPage() {
  const { user } = useAuth();
  const { subscription, checkLimit, isFreePlan } = useUserSubscription();
  const [agencies, setAgencies] = useState<AgencyWithSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [agencyLimit, setAgencyLimit] = useState<any>(null);

  useEffect(() => {
    loadAgencies();
    checkAgencyLimits();
  }, []);

  const loadAgencies = async () => {
    try {
      const { agencies: agenciesData, error } = await getAgenciesWithSubscriptions();
      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Error loading agencies:', error);
      toast.error('Erreur lors du chargement des agences');
    } finally {
      setLoading(false);
    }
  };

  const checkAgencyLimits = async () => {
    if (!user?.id) return;
    
    const limit = await checkLimit('agencies');
    setAgencyLimit(limit);
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userAgencies = user ? agencies.filter(agency => 
    // Ici, on devrait vérifier si l'agence appartient à l'utilisateur
    // Pour l'instant, on utilise une logique simple
    true
  ) : [];

  const canCreateAgency = agencyLimit ? agencyLimit.allowed : true;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Agences Immobilières</h1>
          <p className="text-muted-foreground">
            Découvrez les meilleures agences immobilières de votre région
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Bouton d'upgrade pour les plans gratuits */}
          {user && isFreePlan() && (
            <UpgradeButton 
              planName="Premium"
              variant="outline"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            />
          )}
          
          {/* Bouton créer une agence */}
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

      {/* Alerte de limite atteinte */}
      {agencyLimit && !agencyLimit.allowed && (
        <div className="mb-6">
          <LimitWarning
            resourceType="agencies"
            currentCount={agencyLimit.currentCount}
            maxAllowed={agencyLimit.maxAllowed}
            onUpgrade={() => window.location.href = '/pricing'}
          />
        </div>
      )}

      {/* Informations sur l'abonnement actuel */}
      {user && subscription && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Votre abonnement actuel</CardTitle>
            <CardDescription>
              Plan {subscription.plan?.name} - 
              {agencyLimit && (
                <span className="ml-2">
                  {agencyLimit.currentCount}/{agencyLimit.maxAllowed} agences utilisées
                  ({agencyLimit.percentageUsed}%)
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Liste des agences */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <Card key={agency.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {agency.logoUrl ? (
                      <img 
                        src={agency.logoUrl} 
                        alt={agency.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agency.name}</CardTitle>
                  </div>
                </div>
                
                {/* Badge du plan */}
                {agency.subscription?.plan && (
                  <Badge 
                    variant={agency.subscription.plan.price === 0 ? "secondary" : "default"}
                    className={agency.subscription.plan.price === 0 ? "" : "bg-gradient-to-r from-purple-600 to-blue-600"}
                  >
                    {agency.subscription.plan.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Localisation non spécifiée</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Équipe professionnelle</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Nouveau sur la plateforme</span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/agencies/${agency.id}`}>
                    Voir l'agence
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucune agence */}
      {filteredAgencies.length === 0 && (
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
      )}
    </div>
  );
}
