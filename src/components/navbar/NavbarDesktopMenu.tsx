import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { LogOut, User, Info } from "lucide-react";
import { UserType } from "./types";
import { cn } from "@/lib/utils";
import LoginDialog from "@/components/auth/LoginDialog";
import QuickVisitorIndicator from "@/components/visitor/QuickVisitorIndicator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface NavbarDesktopMenuProps {
  navLinks: { name: string; path: string }[];
  userTypes: UserType[];
  location: any;
}

export function NavbarDesktopMenu({
  userTypes,
  location
}: NavbarDesktopMenuProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'agency' | 'admin'>('agency');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, profile, signOut } = useAuth();
  const userRole = profile?.role || null;

  const handleAccountClick = () => {
    if (profile?.role === 'agency') {
      navigate('/my-agencies');
    }
    // Suppression de la navigation vers /profile pour les autres utilisateurs
  };

  const handleUserTypeClick = (type: UserType) => {
    console.log(`${type.name} Clicked. User authenticated:`, !!user);
    
    // Les pages publiques sont accessibles sans authentification
    if (type.isPublic) {
      console.log('Navigating to public page:', type.name);
      navigate(type.path);
      return;
    }
    
    // Pour l'espace agence - dashboard d'administration
    if (type.path === '/agencies') {
      console.log('🏢 Navigation Desktop Espace Agence:', {
        user: !!user,
        role: profile?.role,
        agency_id: profile?.agency_id
      });
      
      if (user && profile?.role === 'agency') {
        // Rediriger vers la page de gestion des agences
        console.log('🎯 Redirection desktop vers: /my-agencies');
        navigate('/my-agencies');
      } else {
        // Ouvrir popup de connexion agence
        console.log('🔐 Ouverture popup de connexion agence (desktop)');
        setSelectedUserType('agency');
        setLoginDialogOpen(true);
      }
      return;
    }
    
    if (user) {
      console.log('User object:', user);
      console.log('Redirecting to:', type.path);
      navigate(type.path);
    } else {
      console.log('No user session, opening login dialog.');
      setSelectedUserType(type.role === 'admin' ? 'admin' : 'agency');
      setLoginDialogOpen(true);
    }
  };

  const onLogoutClick = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log('Initiating logout...');
      
      await signOut();
      console.log('Logout completed successfully');
      navigate('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('auth.logoutError'));
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="hidden md:flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1">
          {userTypes.map((type) => {
            const isActive = location.pathname.includes(type.path.split("?")[0].toLowerCase()) ||
                           (user && userRole === type.role);
            
            return (
              <button
                key={type.name}
                className={cn(
                  "group relative px-2 py-1.5 rounded-md font-medium text-xs transition-all duration-300 transform",
                  "hover:scale-105 hover:shadow-md active:scale-95",
                  type.name === 'IMMOO Agency'
                    ? "bg-gradient-to-r from-blue-600 to-gray-900 text-white shadow-sm hover:from-blue-700 hover:to-black hover:shadow-lg"
                    : isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200"
                )}
                onClick={() => handleUserTypeClick(type)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {type.name === 'IMMOO Agency' ? (
                    <>
                      <Info className="h-4 w-4 animate-pulse" />
                      <span className="hidden sm:inline">Découvrir</span>
                      <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </>
                  ) : (
                    type.name
                  )}
                </span>
                {isActive && type.name !== 'IMMOO Agency' && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-immoo-gold shadow" />
                )}
                {type.name === 'IMMOO Agency' && (
                  <span className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                )}
              </button>
            );
          })}




          {/* Quick Visitor Indicator - only show if no user logged in */}
          {!user && (
            <div className="mx-2">
              <QuickVisitorIndicator />
            </div>
          )}

          {/* Language Switcher and User Actions */}
          <div className="flex items-center gap-0.5">
            <LanguageSwitcher />
            {user && profile?.role === 'agency' && (
              <>
                <ButtonEffects
                  variant="ghost"
                  size="sm"
                  className="mx-0.5"
                  onClick={handleAccountClick}
                >
                  <User className="h-4 w-4" />
                </ButtonEffects>
                <ButtonEffects
                  variant="ghost"
                  size="sm"
                  className="mx-0.5"
                  onClick={onLogoutClick}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                </ButtonEffects>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
        userType={selectedUserType}
      />
    </>
  );
}
