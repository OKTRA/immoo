
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllAgencies } from "@/services/agency";
import AgencyCard from "@/components/AgencyCard";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Building, Plus, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { useEffect, useState } from "react";
import { isSupabaseConnected, supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/authService";

export default function AgenciesPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await isSupabaseConnected();
      setIsConnected(connected);
      
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Fetch user profile to get role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
            
          setUserRole(profileData?.role || null);
        } else {
          console.log("Utilisateur non authentifié - certaines fonctionnalités pourraient être limitées");
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
    document.title = "Agences | Immobilier";
  }, []);

  const { data, isLoading: isLoadingAgencies, error, refetch } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => getAllAgencies(100, 0),
    enabled: isConnected !== false,
  });

  useEffect(() => {
    if (error) {
      console.error("Erreur lors de la récupération des agences:", error);
      toast.error("Impossible de récupérer les agences. Veuillez vérifier votre connexion.");
    }
  }, [error]);

  const handleLogout = async () => {
    try {
      console.log('Starting agencies page logout...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Agencies logout error:', error);
        throw error;
      }
      
      setUser(null);
      setUserRole(null);
      toast.success("Vous avez été déconnecté avec succès");
      navigate("/");
    } catch (error: any) {
      console.error('Error during agencies logout:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleAgencyDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['agencies'] });
    refetch();
  };

  const agencies = data?.agencies || [];
  const totalAgencies = data?.count || 0;

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes agences immobilières</h1>
          <p className="text-muted-foreground">
            {totalAgencies} {totalAgencies > 1 ? 'agences' : 'agence'} dans votre compte
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
          <Link to="/agencies/create">
            <ButtonEffects className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Créer une agence
            </ButtonEffects>
          </Link>
        </div>
      </div>

      {isLoadingAgencies ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <AnimatedCard key={i} className="p-6 h-52">
              <div className="animate-pulse flex flex-col h-full">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-muted/50 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-4 bg-muted/50 rounded w-full"></div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      ) : error ? (
        <AnimatedCard className="p-6 text-center">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Impossible de charger les agences</h3>
          <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
          <p className="text-sm text-red-500 mt-2">
            {user ? 
              "Erreur lors de la récupération des données. Vérifiez vos droits d'accès." : 
              "Vous n'êtes pas connecté. Connectez-vous pour voir vos agences."}
          </p>
        </AnimatedCard>
      ) : agencies.length === 0 ? (
        <AnimatedCard className="p-8 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-2xl font-medium mb-4">Aucune agence trouvée</h3>
          <p className="text-muted-foreground mb-6">
            {user ? 
              "Vous n'avez pas encore créé d'agence immobilière." : 
              "Connectez-vous pour créer et gérer vos agences immobilières."}
          </p>
          <Link to="/agencies/create">
            <ButtonEffects className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Créer une agence
            </ButtonEffects>
          </Link>
        </AnimatedCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agencies.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} onDelete={handleAgencyDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
