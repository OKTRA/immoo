import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import AuthPopupManager from './AuthPopupManager';

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
  const { user, profile } = useAuth();
  const [authPopup, setAuthPopup] = useState<{ isOpen: boolean; type: 'agency' | 'visitor' | null }>({ isOpen: false, type: null });

  const navItems: NavItem[] = [
    {
      icon: <Search className="h-5 w-5" />,
      label: 'Recherche',
      path: '/',
      isActive: (pathname) => pathname === '/',
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Espace Agence',
      path: '/agencies',
      isActive: (pathname) => pathname.startsWith('/agencies'),
      requiresAuth: true,
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

    // Pour l'espace agence - dashboard d'administration
    if (item.path === '/agencies') {
      console.log('🏢 Navigation Espace Agence:', {
        user: !!user,
        role: profile?.role,
        agency_id: profile?.agency_id
      });
      
      if (user && profile?.role === 'agency' && profile?.agency_id) {
        // Rediriger vers le dashboard de l'agence connectée
        console.log(`🎯 Redirection vers: /agencies/${profile.agency_id}`);
        navigate(`/agencies/${profile.agency_id}`);
      } else {
        // Ouvrir popup de connexion agence
        console.log('🔐 Ouverture popup de connexion agence');
        setAuthPopup({ isOpen: true, type: 'agency' });
      }
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
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-immoo-gray/20 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 h-16">
        {navItems.map((item, index) => {
          const isActive = item.isActive(location.pathname);
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-12 px-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-immoo-navy/10 text-immoo-navy" 
                  : "text-immoo-gray hover:bg-immoo-gray/10 hover:text-immoo-navy"
              )}
            >
              <div className={cn(
                "transition-all duration-200",
                isActive && "scale-110"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "text-immoo-navy" : "text-immoo-gray"
              )}>
                {item.label}
              </span>
              
              {/* Indicateur actif */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-immoo-gold rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
      
      <AuthPopupManager 
        isOpen={authPopup.isOpen}
        onClose={() => setAuthPopup({ isOpen: false, type: null })}
        type={authPopup.type}
      />
    </nav>
  );
}
