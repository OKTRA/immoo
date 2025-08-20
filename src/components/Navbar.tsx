import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { NavbarDesktopMenu } from "./navbar/NavbarDesktopMenu";
import { NavbarMobileMenu } from "./navbar/NavbarMobileMenu";
import { UserType } from "./navbar/types";
import ImmooLogoAdaptive from "./ui/ImmooLogoAdaptive";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "./ui/LanguageSwitcher";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Utilisation du contexte d'authentification global
  const { isLoading } = useAuth();

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

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const userTypes: UserType[] = [
    { 
      name: "IMMOO Agency", 
      path: "/immo-agency",
      role: "agency",
      isPublic: true
    },
  ];



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
              location={location}
            />
          </div>

          {/* Boutons mobile - positionnés à droite */}
          <div className="md:hidden ml-auto flex items-center space-x-2">
            {/* Language Switcher ultra minimaliste - visible en permanence sur mobile */}
            <div className="mr-2">
              <LanguageSwitcher />
            </div>
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
        location={location}
      />
    </header>
  );
}
