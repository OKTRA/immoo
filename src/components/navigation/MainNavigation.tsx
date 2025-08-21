import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Home, 
  Building2, 
  Search, 
  Users, 
  User, 
  LogOut,
  Settings,
  BarChart3,
  CreditCard,
  Shield
} from 'lucide-react';
import { navigationConfig } from '@/config/routes';

const MainNavigation: React.FC = () => {
  const { profile, signOut, getUserRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = getUserRole();
  const navigationItems = navigationConfig[userRole as keyof typeof navigationConfig] || navigationConfig.public;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      home: <Home className="w-4 h-4" />,
      building: <Building2 className="w-4 h-4" />,
      search: <Search className="w-4 h-4" />,
      users: <Users className="w-4 h-4" />,
      user: <User className="w-4 h-4" />,
      dashboard: <BarChart3 className="w-4 h-4" />,
      creditCard: <CreditCard className="w-4 h-4" />,
      settings: <Settings className="w-4 h-4" />,
      chart: <BarChart3 className="w-4 h-4" />
    };
    return iconMap[iconName] || <Home className="w-4 h-4" />;
  };

  return (
    <nav className="bg-white dark:bg-immoo-navy shadow-sm border-b border-immoo-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-immoo-gold rounded-lg flex items-center justify-center">
                <span className="text-immoo-navy font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold text-immoo-navy dark:text-immoo-pearl">
                IMMOO
              </span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? 'border-immoo-gold text-immoo-navy dark:text-immoo-pearl'
                      : 'border-transparent text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-navy dark:hover:text-immoo-pearl hover:border-immoo-gold/50'
                  }`}
                >
                  {getIcon(item.icon)}
                  <span className="ml-2">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Côté droit - Profil utilisateur et menu mobile */}
          <div className="flex items-center space-x-4">
            {/* Indicateur de rôle */}
            {profile && (
              <div className="hidden sm:flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className="bg-immoo-gold/10 text-immoo-navy border-immoo-gold/20"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {userRole}
                </Badge>
              </div>
            )}

            {/* Menu utilisateur */}
            {profile ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profil</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-immoo-gold text-immoo-navy hover:bg-immoo-gold-light">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}

            {/* Bouton menu mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-immoo-navy border-t border-immoo-gold/20">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-immoo-gold/10 text-immoo-navy dark:text-immoo-pearl border-l-4 border-immoo-gold'
                    : 'text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-navy dark:hover:text-immoo-pearl hover:bg-immoo-gold/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            
            {/* Séparateur pour les actions utilisateur */}
            {profile && (
              <>
                <div className="border-t border-immoo-gold/20 my-3"></div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-navy dark:hover:text-immoo-pearl hover:bg-immoo-gold/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4" />
                    <span>Mon Profil</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-immoo-navy/70 dark:text-immoo-pearl/70 hover:text-immoo-navy dark:hover:text-immoo-pearl hover:bg-immoo-gold/5"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavigation;
