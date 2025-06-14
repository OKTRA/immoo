
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { LogOut } from "lucide-react";
import { UserType } from "./types";
import { cn } from "@/lib/utils";
import LoginDialog from "@/components/auth/LoginDialog";

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

  const handleUserTypeClick = (type: UserType) => {
    if (user) {
      navigate(type.path);
    } else {
      setSelectedUserType(type.role === 'admin' ? 'admin' : 'agency');
      setLoginDialogOpen(true);
    }
  };

  return (
    <>
      <div className="hidden md:flex items-center space-x-4">
        <div className="hidden md:flex">
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

          {user && (
            <ButtonEffects
              variant="ghost"
              size="sm"
              className="mx-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Déconnexion
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
