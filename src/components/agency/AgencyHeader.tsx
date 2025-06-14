
import { useParams } from "react-router-dom";
import { LogOut, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById } from "@/services/agency";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AgencyHeader() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  
  const { data: agencyData } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId
  });
  
  const agency = agencyData?.agency || null;

  const handleSignOut = async () => {
    try {
      console.log('Starting agency logout...');
      
      // Clear local storage first
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-hzbogwleoszwtneveuvx-auth-token');
      
      // Try to sign out, but don't fail if the session is already invalid
      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          console.warn('Logout warning:', error);
        }
      } catch (authError: any) {
        console.log('Auth session already invalid, continuing logout...');
      }
      
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      // Even if there's an error, still navigate away and show success
      toast.success("Déconnexion réussie");
      navigate("/");
    }
  };

  const handleExitAgencySpace = () => {
    navigate("/agencies");
    toast.success("Vous avez quitté l'espace agence");
  };

  return (
    <header className="w-full h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        {agency?.logoUrl ? (
          <img 
            src={agency.logoUrl} 
            alt={agency.name || "Agency logo"} 
            className="h-9 w-9 rounded object-cover mr-3"
          />
        ) : (
          <div className="h-9 w-9 rounded bg-muted flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <h1 className="text-xl font-semibold">
          {agency?.name || "Administration de l'agence"}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExitAgencySpace}>
          <Home className="h-4 w-4 mr-2" />
          Quitter l'espace agence
        </Button>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </header>
  );
}
