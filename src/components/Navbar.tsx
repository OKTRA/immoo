import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { getCurrentUser } from "@/services/authService";
import { toast } from "sonner";
import { NavbarDesktopMenu } from "./navbar/NavbarDesktopMenu";
import { NavbarMobileMenu } from "./navbar/NavbarMobileMenu";
import { UserType } from "./navbar/types";
import { supabase } from "@/lib/supabase";
import ImmooLogoAdaptive from "./ui/ImmooLogoAdaptive";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user || null;
        
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
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile to get role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUserRole(profileData?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const userTypes: UserType[] = [
    { 
      name: "Espace Agence", 
      path: "/agencies",
      role: "agency" 
    },
    { 
      name: "Admin", 
      path: "/admin",
      role: "admin" 
    },
  ];

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear local storage first
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-hzbogwleoszwtneveuvx-auth-token');
      
      // Sign out from Supabase - this will trigger onAuthStateChange
      const { error } = await supabase.auth.signOut();
      
      if (error && error.message !== 'Auth session missing!') {
        console.warn('Logout warning:', error);
        // Force clear state if signOut fails
        setUser(null);
        setUserRole(null);
      }
      
      console.log('Logout successful');
      toast.success("Vous avez été déconnecté avec succès");
      
      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force clear state and navigate if there's an error
      setUser(null);
      setUserRole(null);
      toast.success("Vous avez été déconnecté avec succès");
      navigate("/");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-200 ease-in-out",
        isScrolled 
          ? "bg-immoo-pearl/90 dark:bg-immoo-navy/90 backdrop-blur-md shadow-lg border-b border-immoo-gray/20 py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between md:justify-center relative">
          {/* Logo - centré sur toutes les tailles d'écran */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
            <ImmooLogoAdaptive 
              onClick={() => navigate("/")}
              size="medium"
              className="transition-all duration-200 hover:scale-105"
            />
          </div>

          {/* Menu desktop à droite - caché sur mobile */}
          <div className="hidden md:flex md:absolute md:right-0">
            <NavbarDesktopMenu 
              navLinks={[]}
              userTypes={userTypes}
              user={user}
              userRole={userRole}
              location={location}
              handleLogout={handleLogout}
            />
          </div>

          {/* Bouton mobile - positionné à droite */}
          <div className="md:hidden ml-auto">
            <button
              className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-immoo-gray/20 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 group"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <div className="flex flex-col items-center justify-center w-5 h-5">
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-immoo-navy rounded-full transition-all duration-300 transform",
                    mobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-immoo-navy rounded-full transition-all duration-300",
                    mobileMenuOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-immoo-navy rounded-full transition-all duration-300 transform",
                    mobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
                  )}
                />
              </div>
            </button>
          </div>
        </nav>
      </div>

      <NavbarMobileMenu 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navLinks={[]}
        userTypes={userTypes}
        handleLogout={handleLogout}
        user={user}
        location={location}
      />
    </header>
  );
}
