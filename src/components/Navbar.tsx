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
import ImmooLogo from "./ui/ImmooLogo";

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
        <nav className="flex items-center justify-between">
          {/* Espace gauche pour équilibrer */}
          <div className="flex-1 md:flex hidden"></div>

          {/* Logo centré */}
          <div className="flex justify-center">
            <ImmooLogo 
              onClick={() => navigate("/")}
              size="medium"
              className="transition-all duration-200 hover:scale-105"
            />
          </div>

          {/* Menu desktop à droite */}
          <div className="flex-1 flex justify-end">
            <NavbarDesktopMenu 
              navLinks={[]}
              userTypes={userTypes}
              user={user}
              userRole={userRole}
              location={location}
              handleLogout={handleLogout}
            />
          </div>

          {/* Bouton mobile */}
          <button
            className="md:hidden text-immoo-navy dark:text-immoo-pearl p-2 rounded-md hover:bg-immoo-gray/20 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
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
