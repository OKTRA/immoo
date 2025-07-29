import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { LogOut } from "lucide-react";
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
  user: any;
  userRole: string | null;
  location: any;
  handleLogout: () => void;
}

export function NavbarDesktopMenu({
  userTypes,
  user,
  userRole,
  location,
  handleLogout
}: NavbarDesktopMenuProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'agency' | 'admin'>('agency');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { profile } = useAuth();

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
      
      await handleLogout();
      console.log('Logout completed successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('auth.logoutError'));
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
                  "relative px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200",
                  "hover:bg-gray-100 active:bg-gray-200",
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                )}
                onClick={() => handleUserTypeClick(type)}
              >
                <span className="relative z-10">
                  {type.name}
                </span>
                {isActive && (
                  <div className="absolute inset-0 bg-gray-800 rounded-md" />
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

          {/* Language Switcher */}
          <div className="mx-2">
            <LanguageSwitcher />
          </div>

          {user && (
            <ButtonEffects
              variant="ghost"
              size="sm"
              className="mx-1"
              onClick={onLogoutClick}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
            </ButtonEffects>
          )}
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
