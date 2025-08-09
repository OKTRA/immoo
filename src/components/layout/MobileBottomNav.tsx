import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: (pathname: string) => boolean;
  requiresAuth?: boolean;
}

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();


  const navItems: NavItem[] = [
    {
      icon: <Search className="h-5 w-5" />,
      label: 'Recherche',
      path: '/',
      isActive: (pathname) => pathname === '/',
    },
    
    {
      icon: <Users className="h-5 w-5" />,
      label: 'IMMOO Agency',
      path: '/immo-agency',
      isActive: (pathname) => pathname === '/immo-agency',
    },
  ];

  const handleNavClick = (item: NavItem) => {
    // Pour la recherche (accueil), toujours naviguer
    if (item.path === '/') {
      navigate('/');
      return;
    }


    // Pour IMMOO Agency - rediriger vers la page
    if (item.path === '/immo-agency') {
      navigate('/immo-agency');
      return;
    }

    // Par défaut, naviguer
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
      <div className="mobile-flex-between px-2 py-2 h-14">
        {navItems.map((item, index) => {
          const isActive = item.isActive(location.pathname);
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "mobile-flex-center flex-col gap-0.5 h-10 px-2 rounded-lg transition-all duration-200 hover:scale-105 relative flex-1",
                isActive 
                  ? "text-immoo-gold" 
                  : "text-gray-600 hover:text-immoo-navy"
              )}
              onClick={() => handleNavClick(item)}
            >
              {/* Indicateur actif en arrière-plan */}
              {isActive && (
                <div className="absolute inset-0 bg-immoo-gold/10 rounded-lg" />
              )}
              
              <div className={cn(
                "transition-all duration-200 relative z-10",
                isActive ? "scale-110" : "scale-100"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200 relative z-10",
                isActive ? "text-immoo-gold" : "text-gray-500"
              )}>
                {item.label}
              </span>
              
              {/*// Point indicateur moderne */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-immoo-gold rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
