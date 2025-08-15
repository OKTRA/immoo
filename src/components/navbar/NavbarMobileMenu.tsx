import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { UserType } from "./types";
import LoginDialog from "@/components/auth/LoginDialog";
import { ChevronRight, User, Shield, LogOut, Home } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

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
  const { t } = useTranslation();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'agency' | 'admin'>('agency');

  const handleUserTypeClick = (type: UserType) => {
    setMobileMenuOpen(false);
    
    // Les pages publiques sont accessibles sans authentification
    if (type.isPublic) {
      navigate(type.path);
      return;
    }
    
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getIcon = (type: UserType) => {
    if (type.role === 'admin') return Shield;
    return User;
  };

  return (
    <>
      {/* Backdrop avec animation */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300 ease-out",
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu principal */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white z-50 md:hidden transform transition-all duration-300 ease-out shadow-2xl",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header du menu */}
        <div className="bg-gradient-to-r from-immoo-navy to-immoo-navy-light px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-immoo-pearl">IMMOO</h3>
              <p className="text-xs text-immoo-pearl/70 mt-1">{t('navbar.navigationMenu')}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-immoo-pearl hover:bg-white/20 transition-colors duration-200"
              aria-label={t('navbar.closeMenu')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu du menu */}
        <div className="flex flex-col h-full bg-white">
          <nav className="flex-1 px-4 py-4">
            {/* Accueil */}
            <div className="mb-8">
              <button
                onClick={handleHomeClick}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-immoo-pearl hover:bg-immoo-gold/10 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-immoo-gold/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-immoo-gold" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-immoo-navy">{t('navbar.home')}</div>
                    <div className="text-xs text-immoo-navy/60">{t('navbar.mainPage')}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-immoo-navy/40 group-hover:text-immoo-gold group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>



            {/* Espaces */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-immoo-navy/60 mb-4 px-2">{t('navbar.spaces')}</h4>
              <div className="space-y-3">
                {userTypes.map((type) => {
                  const IconComponent = getIcon(type);
                  return (
                    <button
                      key={type.name}
                      onClick={() => handleUserTypeClick(type)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-immoo-pearl transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          type.role === 'admin' 
                            ? "bg-red-100 text-red-600" 
                            : "bg-blue-100 text-blue-600"
                        )}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm text-immoo-navy">{type.name}</div>
                          <div className="text-xs text-immoo-navy/60">
                            {type.role === 'admin' ? t('navbar.administration') : t('navbar.propertyManagement')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-immoo-navy/40 group-hover:text-immoo-gold group-hover:translate-x-1 transition-all duration-200" />
                    </button>
                  );
                })}
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/search?listingType=sale'); }}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-immoo-pearl transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
                      <span className="text-xs font-bold">VN</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm text-immoo-navy">Vente</div>
                      <div className="text-xs text-immoo-navy/60">Biens et terrains à vendre</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-immoo-navy/40 group-hover:text-immoo-gold group-hover:translate-x-1 transition-all duration-200" />
                </button>
              </div>
            </div>
          </nav>

          {/* Footer du menu */}
          {user && (
            <div className="px-6 py-6 border-t border-immoo-gray/20">
              <button
                onClick={onLogoutClick}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-red-700">{t('navbar.logout')}</div>
                    <div className="text-xs text-red-600/60">{t('navbar.leaveSession')}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
          )}

          {/* Branding footer */}
          <div className="px-6 py-4 bg-immoo-pearl/50">
            <div className="text-center">
              <p className="text-xs text-immoo-navy/50">
                © 2024 IMMOO • {t('navbar.platform')}
              </p>
            </div>
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
