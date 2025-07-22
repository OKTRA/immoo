import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { LogOut } from "lucide-react";
import { UserType } from "./types";
import { cn } from "@/lib/utils";
import LoginDialog from "@/components/auth/LoginDialog";
import QuickVisitorIndicator from "@/components/visitor/QuickVisitorIndicator";
import { toast } from "sonner";

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
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'agency' | 'admin'>('agency');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleUserTypeClick = (type: UserType) => {
    console.log(`${type.name} Clicked. User authenticated:`, !!user);
    
    // Les pages publiques sont accessibles sans authentification
    if (type.isPublic) {
      console.log('Navigating to public page:', type.name);
      navigate(type.path);
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
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="hidden md:flex items-center space-x-4">
        <div className="hidden md:flex items-center">
          {userTypes.map((type) => (
            <ButtonEffects 
              key={type.name}
              variant="ghost" 
              size="sm"
              className={cn(
                "mx-1",
                (location.pathname.includes(type.path.split("?")[0].toLowerCase()) ||
                 (user && userRole === type.role)) && 
                "bg-primary/10 text-primary"
              )}
              onClick={() => handleUserTypeClick(type)}
            >
              {type.name}
            </ButtonEffects>
          ))}

          {/* Quick Visitor Indicator - only show if no user logged in */}
          {!user && (
            <div className="mx-2">
              <QuickVisitorIndicator />
            </div>
          )}

          {user && (
            <ButtonEffects
              variant="ghost"
              size="sm"
              className="mx-1"
              onClick={onLogoutClick}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-1" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
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
