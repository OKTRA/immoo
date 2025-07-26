import React from 'react';
import { useLocation } from 'react-router-dom';
import MobileTopBar from './MobileTopBar';
import MobileBottomNav from './MobileBottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();
  
  // Pages qui n'ont pas besoin de la navigation mobile (auth, admin, etc.)
  const excludeNavPages = ['/auth', '/login', '/admin-auth', '/admin'];
  const shouldShowNav = !excludeNavPages.some(page => location.pathname.startsWith(page));

  return (
    <div className="min-h-screen bg-gradient-to-br from-immoo-pearl via-immoo-gold/20 to-immoo-navy flex flex-col">
      {/* Barre supérieure mobile */}
      {shouldShowNav && <MobileTopBar />}
      
      {/* Contenu principal */}
      <main className={`flex-1 ${shouldShowNav ? 'pt-16 pb-20' : ''}`}>
        {children}
      </main>
      
      {/* Navigation en bas */}
      {shouldShowNav && <MobileBottomNav />}
    </div>
  );
}
