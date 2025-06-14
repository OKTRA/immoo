
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { UserType } from "./types";
import LoginDialog from "@/components/auth/LoginDialog";

interface NavbarMobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navLinks: { name: string; path: string }[];
  userTypes: UserType[];
  handleLogout: () => void;
  user: any;
  location: any;
}

export function NavbarMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  userTypes,
  handleLogout,
  user,
}: NavbarMobileMenuProps) {
  const navigate = useNavigate();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'agency' | 'admin'>('agency');

  const handleUserTypeClick = (type: UserType) => {
    setMobileMenuOpen(false);
    if (user) {
      navigate(type.path);
    } else {
      setSelectedUserType(type.role === 'admin' ? 'admin' : 'agency');
      setLoginDialogOpen(true);
    }
  };

  const onLogoutClick = async () => {
    setMobileMenuOpen(false);
    try {
      await handleLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 top-[58px] bg-background/95 backdrop-blur-sm z-40 md:hidden transform transition-transform duration-200 ease-in-out", 
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="container px-4 py-8 flex flex-col">
          <div className="space-y-3 border-t border-border pt-6">
            <p className="px-4 text-sm font-medium text-muted-foreground mb-2">Espaces</p>
            {userTypes.map((type) => (
              <div
                key={type.name}
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleUserTypeClick(type)}
              >
                {type.name}
              </div>
            ))}
            
            {user && (
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={onLogoutClick}
              >
                Déconnexion
              </div>
            )}
          </div>
        </nav>
      </div>

      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
        userType={selectedUserType}
      />
    </>
  );
}
