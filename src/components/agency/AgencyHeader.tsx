import { useParams } from "react-router-dom";
import { LogOut, User, Home, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById } from "@/services/agency";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

export default function AgencyHeader() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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
      
      // Sign out from Supabase - this will trigger onAuthStateChange
      const { error } = await supabase.auth.signOut();
      
      if (error && error.message !== 'Auth session missing!') {
        console.warn('Logout warning:', error);
      }
      
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.success("Déconnexion réussie");
      navigate("/");
    }
  };

  const handleExitAgencySpace = () => {
    navigate("/my-agencies");
    toast.success("Vous avez quitté l'espace agence");
  };

  return (
    <header className="w-full h-20 border-b border-immoo-gray/20 bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center">
        {agency?.logoUrl ? (
          <img 
            src={`${agency.logoUrl}?t=${Date.now()}`} 
            alt={agency.name || "Agency logo"} 
            className="h-12 w-12 rounded-xl object-cover mr-4 border-2 border-immoo-gold/30 shadow-md"
            onError={(e) => {
              console.error('Error loading agency logo in header:', e);
              // Fallback to default icon if logo fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-immoo-gold to-immoo-navy flex items-center justify-center mr-4 shadow-md">
            <User className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-immoo-navy">
            {agency?.name || t('agencyDashboard.header.title')}
          </h1>
          <p className="text-sm text-immoo-gray">
            {t('agencyDashboard.header.subtitle')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Bouton de traduction EN/FR - En première position */}
        <div className="relative">
          <LanguageSwitcher variant="agency" className="minimalist-lang-btn" />
        </div>
        
        {/* Bouton Quitter l'espace agence */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleExitAgencySpace}
          className="border-immoo-gray/30 text-immoo-navy hover:bg-immoo-pearl hover:border-immoo-gold transition-all duration-300 w-11 h-11"
          title={t('agencyDashboard.header.leaveAgencySpace')}
        >
          <DoorOpen className="h-5 w-5" />
        </Button>
        
        {/* Bouton Se déconnecter */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleSignOut}
          className="border-immoo-gray/30 text-immoo-navy hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 w-11 h-11"
          title={t('agencyDashboard.header.logout')}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
