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
      
      if (user && profile?.role === 'agency') {
        // Rediriger vers la page de gestion des agences
        console.log('🎯 Redirection mobile vers: /my-agencies');
        navigate('/my-agencies');
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
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-t from-white/95 to-white/90 backdrop-blur-lg border-t border-immoo-gray/10 shadow-xl rounded-t-2xl">
      <div className="flex items-center justify-around px-4 py-3 h-16">
        {navItems.map((item, index) => {
          const isActive = item.isActive(location.pathname);
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-12 px-3 rounded-xl transition-all duration-300 hover:scale-105",
                isActive 
                  ? "bg-immoo-navy/5 text-immoo-navy" 
                  : "text-immoo-gray hover:bg-immoo-gold/5 hover:text-immoo-navy"
              )}
              onClick={() => handleNavClick(item)}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive && "scale-110 text-immoo-gold drop-shadow-md"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-xs font-semibold tracking-wide transition-all duration-300",
                isActive ? "text-immoo-gold" : "text-immoo-gray/80"
              )}>
                {item.label}
              </span>
              
              {/* Indicateur actif */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-immoo-gold/0 to-immoo-gold to-immoo-gold/0 rounded-full animate-pulse" />
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
